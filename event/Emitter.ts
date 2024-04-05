/**
 * https://github.com/yoxjs/yox-common/blob/master/src/util/Emitter.ts
 * MIT
 * 
 * @file 事件代理
 */

import * as is from '../util/is'
import * as array from '../util/array'
import CustomEvent from './CustomEvent'
import * as object from '../util/object'
import * as string from '../util/string'
import * as logger from '../util/logger'
import execute from '../function/execute'
import * as constant from '../util/constant'
import { NativeListener, Fn, Task } from '../types/type'

export interface EmitterOptions extends Task {

  // 所在的命名空间
  ns?: string

  // 监听函数已执行次数
  num?: number

  // 监听函数的最大可执行次数
  max?: number

  // 计数器，用于扩展，随便做什么计数都行
  count?: number

}


type Namespace = {

  // 事件名称
  type: string

  // 命名空间
  ns?: string

}

export default class Emitter {

  /**
   * 是否开启命名空间
   */
  ns: boolean

  /**
   * 已注册的事件监听
   */
  listeners: Record<string, EmitterOptions[]>

  /**
   * 原生事件监听，一个事件对应一个 listener
   */
  nativeListeners?: Record<string, NativeListener>

  constructor(ns?: boolean) {
    this.ns = ns || constant.FALSE
    this.listeners = {}
  }

  /**
   * 发射事件
   *
   * @param type 事件名称或命名空间
   * @param args 事件处理函数的参数列表
   * @param filter 自定义过滤器
   */
  fire(
    type: string | Namespace,
    args: any[] | void,
    filter?: (
      namespace: Namespace,
      args: any[] | void,
      options: EmitterOptions
    ) => boolean | void
  ): boolean {

    let instance = this,

        namespace = is.string(type) ? instance.parse(type as string) : type as Namespace,

        list = instance.listeners[namespace.type],

        isComplete = constant.TRUE

    if (list) {

      // 避免遍历过程中，数组发生变化，比如增删了
      list = object.copy(list)

      /*
       * 判断是否是发射事件
       * 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
       * 因为事件处理函数的参数列表是 (event, data)
       */
      const event = args && args[0] instanceof CustomEvent
        ? args[0] as CustomEvent
        : constant.UNDEFINED

      array.each(
        list,
        function (options) {

          // 命名空间不匹配
          if (!matchNamespace(namespace.ns, options, constant.TRUE)
                        // 在 fire 过程中被移除了
                        || !array.has(list, options)
                        // 传了 filter，则用 filter 判断是否过滤此 options
                        || (filter && !filter(namespace, args, options))
          ) {
            return
          }

          /*
           * 为 event 对象加上当前正在处理的 listener
           * 这样方便业务层移除事件绑定
           * 比如 on('xx', function) 这样定义了匿名 listener
           * 在这个 listener 里面获取不到当前 listener 的引用
           * 为了能引用到，有时候会先定义 var listener = function
           * 然后再 on('xx', listener) 这样其实是没有必要的
           */
          if (event) {
            event.listener = options.fn
          }

          let result = execute(options.fn, options.ctx, args)

          if (event) {
            event.listener = constant.UNDEFINED
          }

          // 执行次数
          options.num = options.num ? (options.num + 1) : 1

          // 注册的 listener 可以指定最大执行次数
          if (options.num === options.max) {
            instance.off(namespace, options.fn)
          }

          // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
          if (event) {
            if (result === constant.FALSE) {
              event.prevent().stop()
            }
            else if (event.isStopped) {
              result = constant.FALSE
            }
          }

          if (result === constant.FALSE) {
            return isComplete = constant.FALSE
          }
        }
      )

    }

    return isComplete

  }

  /**
   * 注册监听
   *
   * @param type
   * @param listener
   */
  on(
    type: string | Namespace,
    listener: Function | EmitterOptions
  ): Emitter {

    const instance = this,

        listeners = instance.listeners,

        options: EmitterOptions = is.func(listener)
          ? { fn: listener as Fn }
          : listener as EmitterOptions

    if (is.object(options) && is.func(options.fn)) {
      const namespace = is.string(type) ? instance.parse(type as string) : type as Namespace
      options.ns = namespace.ns
      array.push(
        listeners[namespace.type] || (listeners[namespace.type] = []),
        options
      )
    }
    else if (process.env.NODE_ENV === 'development') {
      logger.fatal('emitter.on(type, listener) invoke failed：\n\n"listener" is expected to be a Function or an EmitterOptions.\n')
    }

    return this
  }

  one(
    type: string | Namespace,
    listener: Function | EmitterOptions
  ): Emitter {
    if (is.func(listener)) {
      listener = {
        fn: listener as Fn,
        max: 1
      }
    }
    else {
      listener.max = 1
    }
    return this.on(type, listener)
  }

  /**
   * 取消监听
   *
   * @param type
   * @param listener
   */
  off(
    type?: string | Namespace,
    listener?: Function
  ): void {

    const instance = this,

        listeners = instance.listeners

    if (type) {

      const namespace = is.string(type) ? instance.parse(type as string) : type as Namespace,

          name = namespace.type,

          ns = namespace.ns,

          matchListener = createMatchListener(listener),

          each = function (list: EmitterOptions[], name: string) {
            array.each(
              list,
              function (options, index) {
                if (matchListener(options)) {
                  list.splice(index, 1)
                }
              },
              constant.TRUE
            )
            if (!list.length) {
              delete listeners[name]
            }
          },

          eachNS = function (list: EmitterOptions[], name: string) {
            array.each(
              list,
              function (options, index) {
                if (matchNamespace(ns, options)) {
                  list.splice(index, 1)
                }
              },
              constant.TRUE
            )
            if (!list.length) {
              delete listeners[name]
            }
          }

      if (name) {
        if (listeners[name]) {
          each(listeners[name], name)
        }
      }
      else if (ns) {
        object.each(listeners, eachNS)
      }

      /*
       * 在开发阶段进行警告，比如传了 listener 进来，listener 是个空值
       * 但你不知道它是空值
       */
      if (process.env.NODE_ENV === 'development') {
        if (arguments.length > 1 && listener == constant.NULL) {
          logger.warn(`emitter.off(type, listener) is invoked, but "listener" is ${listener}.`)
        }
      }

    }
    else {
      // 清空
      instance.listeners = {}
      /*
       * 在开发阶段进行警告，比如传了 type 进来，type 是个空值
       * 但你不知道它是空值
       */
      if (process.env.NODE_ENV === 'development') {
        if (arguments.length > 0) {
          logger.warn(`emitter.off(type) is invoked, but "type" is ${type}.`)
        }
      }
    }

  }

  /**
   * 是否已监听某个事件
   *
   * @param type
   * @param listener
   */
  has(
    type: string | Namespace,
    listener?: Function
  ): boolean {

    let instance = this,

        listeners = instance.listeners,

        namespace = is.string(type) ? instance.parse(type as string) : type as Namespace,

        name = namespace.type,

        ns = namespace.ns,

        result = constant.TRUE,

        matchListener = createMatchListener(listener),

        each = function (list: EmitterOptions[]) {
          array.each(
            list,
            function (options) {
              if (matchListener(options)) {
                return result = constant.FALSE
              }
            }
          )
          return result
        },

        eachNS = function (list: EmitterOptions[]) {
          array.each(
            list,
            function (options) {
              if (matchNamespace(ns, options)) {
                return result = constant.FALSE
              }
            }
          )
          return result
        }

    if (name) {
      if (listeners[name]) {
        each(listeners[name])
      }
    }
    else if (ns) {
      object.each(listeners, eachNS)
    }

    return !result

  }

  /**
   * 把事件类型解析成命名空间格式
   *
   * @param type
   */
  parse(type: string): Namespace {

    /*
     * 这里 ns 必须为字符串
     * 用于区分 event 对象是否已完成命名空间的解析
     */
    const result = {
      type,
      ns: constant.EMPTY_STRING,
    }

    // 是否开启命名空间
    if (this.ns) {
      const index = string.indexOf(type, constant.RAW_DOT)
      if (index >= 0) {
        result.type = string.slice(type, 0, index)
        result.ns = string.slice(type, index + 1)
      }
    }

    return result

  }

}

function matchTrue() {
  return constant.TRUE
}

/**
 * 外部会传入 Function 或 EmitterOptions 或 空
 *
 * 这里根据传入值的不同类型，创建不同的判断函数
 *
 * 如果传入的是 EmitterOptions，则全等判断
 *
 * 如果传入的是 Function，则判断函数是否全等
 *
 * 如果传入的是空，则直接返回 true
 *
 * @param listener
 */
function createMatchListener(listener: Function | void): (options: EmitterOptions) => boolean {
  return is.func(listener)
    ? function (options: EmitterOptions) {
      return listener === options.fn
    }
    : matchTrue
}

/**
 * 判断 options 是否能匹配命名空间
 *
 * 如果 namespace 和 options.ns 都不为空，则需完全匹配
 *
 * 如果他们两个其中任何一个为空，则不判断命名空间
 *
 * @param namespace
 * @param options
 */
function matchNamespace(namespace: string | void, options: EmitterOptions, isFire?: boolean): boolean {
  const { ns } = options
  return ns && namespace
    ? ns === namespace
    : (isFire ? constant.TRUE : constant.FALSE)
}

/**
 * @file 对象操作
 */

import * as is from './is'
import * as array from './array'
import { Data } from '../types/type'
import * as constant from './constant'
import * as keypathUtil from './keypath'
import isDef from '../function/isDef'

/**
 * 获取对象的 key 的数组
 *
 * @param object
 * @return
 */
export function keys<T>(object: T): string[] {
  if (!isDef(object)) {
    return []
  }
  return Object.keys(object)
}

function sortKeyByAsc(a: string, b: string): number {
  return a.length - b.length
}

function sortKeyByDesc(a: string, b: string): number {
  return b.length - a.length
}

/**
 * 排序对象的 key
 *
 * @param object
 * @param desc 是否逆序，默认从小到大排序
 * @return
 */
export function sort(object: Data, desc?: boolean): string[] {
  return keys(object).sort(desc ? sortKeyByDesc : sortKeyByAsc)
}

/**
 * 遍历对象
 *
 * @param object
 * @param callback 返回 false 可停止遍历
 */
export function each<T extends Data>(object: T, callback: (value: T[keyof T], key: string) => boolean | void): void {
  for (let key in object) {
    if (callback(object[key], key) === constant.FALSE) {
      break
    }
  }
}

/**
 * 清空对象所有的键值对
 *
 * @param object
 */
export function clear(object: Data): void {
  each(
    object,
    function (_, key) {
      delete object[key]
    }
  )
}

function _extend<T, U>(original: T, object: U): T & U {
  if (!is.object(original)) {
    return object as any
  }
  else if (!is.object(object)) {
    return original as any
  }
  each(
    object,
    function (value, key) {
      original[key] = value
    }
  )
  return original as any
}

/**
 * 扩展对象
 *
 * @return
 */
export function extend<T, U, V>(original: T, object: U, object2?: V): T & U & V {
  return _extend(_extend(original, object), object2)
}

/**
 * 合并对象
 *
 * @return
 */
export function merge(object1: Data | void, object2: Data | void): Data | void {
  return object1 && object2
    ? extend(extend({}, object1), object2)
    : object1 || object2
}

/**
 * 拷贝对象
 *
 * @param object
 * @param deep 是否需要深拷贝
 * @return
 */
export function copy(object: any, deep?: boolean): any {
  let result = object
  if (is.array(object)) {
    if (deep) {
      result = []
      array.each(
        object,
        function (item, index) {
          result[index] = copy(item, deep)
        }
      )
    }
    else {
      result = object.slice()
    }
  }
  else if (is.object(object)) {
    result = {}
    each(
      object,
      function (value, key) {
        result[key] = deep ? copy(value, deep) : value
      }
    )
  }
  return result
}

/**
 * 从对象中查找一个 keypath
 *
 * 返回值是空时，表示没找到值
 *
 * @param object
 * @param keypath
 * @return
 */
export function get(object: any, keypath: string, defaultValue?: any): any {

  let result: any

  keypathUtil.each(
    keypath,
    function (key, isLast) {

      if (object != constant.NULL) {

        // 先直接取值
        let value = object[key],

            // 紧接着判断值是否存在
            hasValue = value !== constant.UNDEFINED

        if (isLast) {
          if (hasValue) {
            result = value
          }
          else {
            result = constant.UNDEFINED
          }
        }
        else {
          object = value
        }
      }
      else {
        result = constant.UNDEFINED
        return constant.FALSE
      }

    }
  )

  // 没找到使用默认值
  if (result === constant.UNDEFINED) {
    result = defaultValue
  }

  return result

}

/**
 * 为对象设置一个键值对
 *
 * @param object
 * @param keypath
 * @param value
 * @param autofill 是否自动填充不存在的对象，默认自动填充
 */
export function set(object: Data, keypath: string, value: any, autofill?: boolean): void {
  keypathUtil.each(
    keypath,
    function (key, isLast) {
      if (isLast) {
        object[key] = value
      }
      else if (object[key]) {
        object = object[key]
      }
      else if (autofill) {
        object = object[key] = {}
      }
      else {
        return constant.FALSE
      }
    }
  )
}

/**
 * 对象是否包含某个 key
 *
 * @param object
 * @param key
 * @return
 */
export function has<T extends Data>(object: T, key: keyof T): boolean {
  // 不用 hasOwnProperty，性能差
  return object[key] !== constant.UNDEFINED
}

/**
 * 是否是空对象
 *
 * @param object
 * @return
 */
export function falsy(object: any): boolean {
  return !is.object(object)
    || is.array(object)
    || !keys(object).length
}

/**
 * 获取两个对象的 value 不同的 key
 * 
 * @param obj1 
 * @param obj2 
 */
export function diff(obj1: Object, obj2: Object): string[] {
  let differences: string[] = []

  each(obj1, (value, key) => {
    if (is.array(value) || is.isPlainObject(value)) {
      if (obj2[key] == null || diff(value, obj2[key]).length > 0) {
        differences.push(key)
      }
    }
    else if (value !== obj2[key]) {
      differences.push(key)
    }
  })

  return differences
}

/**
 * 序列化对象
 * 
 * @param data
 */
export function param(data: Object | Array<any>) {
  let result = []
  const add = (key: string | number, value: any) => {
    value = is.func(value) ? value() : (value == null ? '' : value)
    result[result.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value)
  }
  if (is.array(data) || is.isPlainObject(data)) {
    if (is.array(data)) {
      array.each(data, (value, key) => {
        add(key, value)
      })
    }
    else {
      each(data, (value, key) => {
        add(key, value)
      })
    }
  }
  return result.join('&').replace(/%20/g, '+')
}

/**
 * 将 object 的 value 变成数组
 */
export function toArray(data: Object) {
  const result = []
  each(data, (value) => {
    result.push(value)
  })
  return result
}

/**
 * 
 * 更新两个同一类型的对象
 * 
 * @param obj1 
 * @param obj2 
 * @returns 
 */
export function update(obj1: Object, obj2: Object) {
  if (!is.object(obj1) || !is.object(obj2)) {
    return
  }

  each(obj2, (value, key) => {
    if (is.object(value) && is.object(obj1[key])) {
      update(obj1[key], value)
    }
    else {
      obj1[key] = obj2[key]
    }
  })

  return obj1
}

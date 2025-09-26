/**
 * @file 节流调用
 */

import execute from './execute'
import type { Fn, Timeout } from '../types/type'
import * as array from '../util/array'
import type { ParamType } from '../types/advanced'

/**
 * 节流调用
 *
 * @param fn 需要节制调用的函数
 * @param delay 调用的时间间隔，单位毫秒
 * @param immediate 是否立即触发
 * @return 节流函数
 */
export default function throttling<T extends Fn>(fn: T, delay: number, immediate?: boolean): T {

  let timer: Timeout

  function run(context: any, args: ParamType<T>) {
    timer = setTimeout(function () {
      if (!immediate) {
        execute(fn, context, args)
      }
      clearTimeout(timer)
      timer = null
    }, delay)
  }

  return function () {
    const context = this
    const args = array.toArray(arguments) as ParamType<T>
    if (!timer) {
      if (immediate) {
        execute(fn, context, args)
      }
      run(context, args)
    }
  } as T
}

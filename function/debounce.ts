/**
 * @file 防抖函数
 */

import execute from './execute'
import { Fn } from '../types/type'
import * as array from '../util/array'
import * as constant from '../util/constant'
import { ParamType } from '../types/advanced'

/**
 * 防抖函数
 *
 * @param fn 需要节制调用的函数
 * @param delay 调用的时间间隔，单位毫秒
 * @param immediate 是否立即触发
 * @return 节流函数
 */
export default function debounce<T extends Fn>(fn: T, delay: number, immediate?: boolean): T {

  let timer: any
  return function () {

    let context = this

    if (!timer) {

      const args = array.toArray(arguments)
      if (immediate) {
        execute(fn, context, args as ParamType<T>)
      }

      timer = setTimeout(
        function () {
          timer = constant.UNDEFINED
          if (!immediate) {
            execute(fn, context, args as ParamType<T>)
          }
        },
        delay
      )
    }
  } as T
}

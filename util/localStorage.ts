/**
 * @file localStorage 操作
 */

import * as is from '../util/is'
import * as object from '../util/object'
import { EMPTY_FUNCTION } from '../util/constant'

/**
 * 是否支持 localStorage
 */
export const support = typeof window === 'object' && typeof window.localStorage !== 'undefined'

let _set: Function = EMPTY_FUNCTION
let _get: Function = EMPTY_FUNCTION
let _remove: Function = EMPTY_FUNCTION

if (support) {
  _set = function (key: string | Object, value?: any) {
    if (is.isPlainObject(key)) {
      object.each(key as Object, (value, key) => {
        _set(key, value)
      })
    }
    else {
      try {
        localStorage[key as string] = value
      }
      catch (error) {}
    }
  }

  _get = function (key: string): any {
    let result: any
    try {
      result = localStorage[key]
    }
    catch (error) {}
    return result
  }

  _remove = function (key: string) {
    try {
      localStorage.removeItem(key)
    }
    catch (error) {}
  }
}

/**
 * 设置一个值
 */
export const set = _set

/**
 * 获取一个值
 */
export const get = _get

/**
 * 移除一个键
 */
export const remove = _remove

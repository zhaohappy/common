/**
 * @file 判断
 */

import * as constant from './constant'

/**
 * Check if value is a function.
 *
 * @param value
 * @return
 */
export function func(value: any): value is Function {
  return typeof value === constant.RAW_FUNCTION
}

/**
 * Check if value is an array.
 *
 * @param value
 * @return
 */
export function array<T>(value: any): value is Array<T> {
  return Array.isArray(value)
}

/**
 * Check if value is an object.
 *
 * @param value
 * @return
 */
export function object(value: any): value is Object {
  // 低版本 IE 会把 null 当作 object
  return value !== constant.NULL && typeof value === 'object'
}

/**
 * Check if value is a string.
 *
 * @param value
 * @return
 */
export function string(value: any): value is string {
  return typeof value === 'string'
}

/**
 * Check if value is a number.
 *
 * @param value
 * @return
 */
export function number(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Check if value is a bigint.
 *
 * @param value
 * @return
 */
export function bigint(value: any): value is bigint {
  return typeof value === 'bigint'
}

/**
 * Check if value is boolean.
 *
 * @param value
 * @return
 */
export function boolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Check if value is numeric.
 *
 * @param value
 * @return
 */
export function numeric(value: any): value is (number | string) {
  return number(value)
    || (string(value) && !isNaN(parseFloat(value)) && isFinite(+value))
}

const hasOwn = {}.hasOwnProperty

/**
 * 判断是不是普通字面量对象
 *
 * @param {*} target
 * @return {boolean}
 */
export function isPlainObject(target: any): target is Object {
  if (!object(target) || target.nodeType || target === target.window) {
    return false
  }

  if ( target.constructor
    && !hasOwn.call(target, 'constructor')
    && !hasOwn.call(target.constructor.prototype || {}, 'isPrototypeOf')) {
    return false
  }

  let key: string
  for ( key in target ) {
    /* empty */
  }
  return key === undefined || hasOwn.call(target, key)
}

/**
 * 判断 value 是否在指定范围中
 * 
 * @param value 待判断值
 * @param min 范围左区间
 * @param max 范围右区间
 */
export function range(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Check if value is ArrayBuffer.
 * 
 * @param value 
 * @returns 
 */
export function arrayBuffer(value: any): value is ArrayBuffer {
  return value instanceof ArrayBuffer
}

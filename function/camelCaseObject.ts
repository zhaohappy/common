/**
 * @file 把对象的所有属性转成小驼峰形式
 */

import * as is from '../util/is'
import camelCase from './camelCase'
import * as array from '../util/array'
import * as object from '../util/object'

/**
 * 把对象的所有属性转成驼峰形式
 * 
 * @param obj 待转换对象
 * @param reg 匹配规则（默认匹配下划线）
 * 
 * @returns 转转之后的对象
 */
export default function camelCaseObject<T extends Array<any> | {[key: string]: any}>(obj: T, reg?: RegExp): Partial<T> {
  let result = is.array(obj) ? [] : {}

  if (is.array(obj)) {
    array.each(obj, (value, key) => {
      if (is.isPlainObject(value) || is.array(value)) {
        value = camelCaseObject(value)
      }
      result[camelCase(key, reg)] = value
    })
  }
  else {
    object.each<T>(obj, (value, key) => {
      if (is.isPlainObject(value) || is.array(value)) {
        value = camelCaseObject(value) as any
      }
      result[camelCase(key, reg)] = value
    })
  }
  return result
}

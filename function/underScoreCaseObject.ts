/**
 * @file 把对象的所有属性转成下划线形式
 */

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import underScoreCase from './underScoreCase'

/**
 * 把对象的所有属性转成驼峰形式
 * 
 * @param obj 待转换对象
 * @param reg 匹配规则（默认匹配下划线）
 * 
 * @returns 转转之后的对象
 */
export default function underScoreCaseObject<T extends Array<any> | {[key: string]: any}>(
  obj: T,
  reg?: RegExp
): Partial<T> {
  let result = is.array(obj) ? [] : {}

  if (is.array(obj)) {
    array.each(obj, (value, key) => {
      if (is.isPlainObject(value) || is.array(value)) {
        value = underScoreCaseObject(value, reg)
      }
      result[underScoreCase(key, reg)] = value
    })
  }
  else {
    object.each<T>(obj, (value, key) => {
      if (is.isPlainObject(value) || is.array(value)) {
        value = underScoreCaseObject(value, reg) as any
      }
      result[underScoreCase(key, reg)] = value
    })
  }
  return result
}

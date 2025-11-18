/**
 * @file 判断是否是 native 方法
 */

import * as is from '../util/is'
import toString from './toString'
import * as string from '../util/string'

/**
 * 判断是否是 native 方法
 * 
 * @param target 待判定函数
 */
export default function isNative(target: any): boolean {
  return is.func(target) && string.has(toString(target), '[native code]')
}

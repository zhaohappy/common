/**
 * @file 强转为 number
 */

import * as is from '../util/is'
import * as constant from '../util/constant'

/**
 * 强转为 number
 * 
 * @param target 待转换值
 * @param defaultValue 默认值
 * 
 * @returns 转换之后的值
 */
export default function toNumber(target: any, defaultValue?: number): number {
  return is.numeric(target)
    ? +target
    : defaultValue !== constant.UNDEFINED
      ? defaultValue as number
      : 0
}

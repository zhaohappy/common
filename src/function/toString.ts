/**
 * @file 强转为 string
 */

import * as constant from '../util/constant'

/**
 * 强转为 string
 * 
 * @param target 待转换的值
 * @param defaultValue 默认值
 * @returns 转换之后的值
 */
export default function toString(target: any, defaultValue?: string): string {
  return target != constant.NULL && target.toString
    ? target.toString()
    : defaultValue !== constant.UNDEFINED
      ? defaultValue as string
      : constant.EMPTY_STRING
}

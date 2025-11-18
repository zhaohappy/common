/**
 * @file 判断是否定义
 */

import * as constant from '../util/constant'

/**
 * 判断是否定义
 * 
 * @param target 待判定变量
 */
export default function isDef(target: any): boolean {
  return target !== constant.UNDEFINED
}

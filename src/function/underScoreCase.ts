/**
 * @file 其他命名方式变下划线，可传入正则（默认小驼峰匹配）
 */

import toString from './toString'

/**
 * 其他命名方式变下划线，可传入正则（默认小驼峰匹配）
 * 
 * @param str 待转换字符串
 * @param reg 匹配正则
 * 
 * @returns 转换之后的值
 */
export default function underScoreCase(str: any, reg: RegExp = /([A-Z])/g): string {
  str = toString(str)
  str = str.replace(reg, '_$1').toLowerCase()
  return str
}

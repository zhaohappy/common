/**
 * @file 其他命名方式变小驼峰，可传入正则（默认下划线匹配）
 */

import toString from './toString'

/**
 * 其他命名方式变小驼峰，可传入正则（默认下划线匹配）
 * 
 * @param str 待转换字符串
 * @param reg 匹配正则
 * 
 * @returns 转换之后的值
 */
export default function camelCase(str: any, reg: RegExp = /\_(\w)/g): string {
  str = toString(str)
  return str.replace(reg, function (all: string, letter: string) {
    return letter.toUpperCase()
  })
}


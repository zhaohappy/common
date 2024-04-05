/**
 * @file string 操作
 */

import * as is from './is'
import * as constant from './constant'
import toString from '../function/toString'

const capitalizePattern = /^[a-z]/, capitalizeCache: Record<string, string> = {}

/**
 * 首字母大写
 *
 * @param str
 * @return
 */
export function capitalize(str: string): string {
  if (!capitalizeCache[str]) {
    capitalizeCache[str] = str.replace(
      capitalizePattern,
      upper
    )
  }
  return capitalizeCache[str]
}

/**
 * 清除两侧空白符
 *
 * @param str
 * @return 清除两侧空白符的字符串
 */
export function trim(str: any): string {
  return falsy(str)
    ? constant.EMPTY_STRING
    : str.trim()
}

/**
 * 截取字符串
 *
 * @param str
 * @param start
 * @param end
 * @return
 */
export function slice(str: string, start: number, end?: number): string {
  return is.number(end)
    ? start === end
      ? constant.EMPTY_STRING
      : str.slice(start, end)
    : str.slice(start)
}

/**
 * 获取子串的起始位置
 *
 * @param str
 * @param part
 * @param start
 * @return
 */
export function indexOf(str: string, part: string, start?: number): number {
  return str.indexOf(part, start !== constant.UNDEFINED ? start : 0)
}

/**
 * 获取子串的起始位置
 *
 * @param str
 * @param part
 * @param end
 * @return
 */
export function lastIndexOf(str: string, part: string, end?: number): number {
  return str.lastIndexOf(part, end !== constant.UNDEFINED ? end : str.length)
}

/**
 * str 是否以 part 开头
 *
 * @param str
 * @param part
 * @return
 */
export function startsWith(str: string, part: string): boolean {
  return indexOf(str, part) === 0
}

/**
 * str 是否以 part 结束
 *
 * @param str
 * @param part
 * @return
 */
export function endsWith(str: string, part: string): boolean {
  const offset = str.length - part.length
  return offset >= 0 && lastIndexOf(str, part) === offset
}

/**
 * 获取某个位置的字符
 */
export function charAt(str: string, index?: number): string {
  return str.charAt(index || 0)
}

/**
 * 获取某个位置的字符编码
 */
export function codeAt(str: string, index?: number): number {
  return str.charCodeAt(index || 0)
}

/**
 * 大写格式
 */
export function upper(str: string): string {
  return str.toUpperCase()
}

/**
 * 小写格式
 */
export function lower(str: string): string {
  return str.toLowerCase()
}

/**
 * str 是否包含 part
 *
 * @param str
 * @param part
 * @return 是否包含
 */
export function has(str: string, part: string): boolean {
  return indexOf(str, part) >= 0
}

/**
 * 判断长度大于 0 的字符串
 *
 * @param str
 * @return
 */
export function falsy(str: any): boolean {
  return !is.string(str) || !str.length
}

/**
 * 格式化输出
 * 
 * @param string 
 * @param args 
 * @returns 
 */
export function format(string: string, ...args: any[]) {
  let i = 0
  const length = args.length
  return string.replace(/(%[sdvx%])|(%0(\d)+[dx])/g, (str) => {
    if (i >= length) {
      // missing argument
      return str
    }

    const arg = args[i++]

    if (/%0(\d)+[dx]/g.test(str)) {
      const length = parseInt(str.substring(1))
      let result = str[str.length - 1] === 'd' ? toString(Number(arg)) : Number(arg).toString(16)
      if (length > result.length) {
        result = new Array(length - result.length).fill('0').join('') + result
      }
      return result
    }

    switch (str) {
      case '%%':
        return '%'
      case '%s':
        return String(arg)
      case '%d':
        return toString(Number(arg))
      case '%v':
        return ''
      case '%x':
        return Number(arg).toString(16)
    }
    return str
  })
}

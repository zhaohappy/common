/**
 * @file 拆解字符串，并 trim 每个部分
 */

import * as is from '../util/is'
import * as array from '../util/array'

/**
 * 拆解字符串，并 trim 每个部分
 * 
 * @param str 字符串
 * @param sep 分隔符
 */
export default function split(str: string | number, sep: string): string[] {

  const result = []

  if (is.number(str)) {
    str = str + ''
  }

  if (str && is.string(str)) {
    array.each(str.split(sep), (part, index) => {
      part = part.trim()
      if (part) {
        result.push(part)
      }
    })
  }

  return result
}

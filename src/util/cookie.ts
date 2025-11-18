/**
 * @file cookie 操作
 */

import * as is from '../util/is'
import split from '../function/split'
import * as array from '../util/array'
import * as object from '../util/object'

const defaultOptions = { }

/**
 * 把 cookie 字符串解析成对象
 *
 * @inner
 * @param cookieStr 格式为 key1=value1;key2=value2;
 * @return {Object}
 */
function parse(cookieStr: string): Object {
  if (cookieStr.indexOf('"') === 0) {
    // 如果 cookie 按照 RFC2068 规范进行了转义，要转成原始格式
    cookieStr = cookieStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }

  const result = {}

  try {
    /*
     * Replace server-side written pluses with spaces.
     * If we can't decode the cookie, ignore it, it's unusable.
     * If we can't parse the cookie, ignore it, it's unusable.
     */
    cookieStr = decodeURIComponent(cookieStr.replace(/\+/g, ' '))
    array.each(split(cookieStr, ';'), (part, index) => {
      let terms = split(part, '=')
      let key = terms[0]
      let value = terms[1]
      if (key) {
        result[key] = value
      }
    })
  }
  catch (error) { }

  return result
}

/**
 * 设置一枚 cookie
 *
 * @inner
 * @param key
 * @param value
 * @param options
 */
function setCookie(
  key: string,
  value: any,
  options: {path?: string, domain?: string, secure?: boolean, expires?: number | Date}
): void {

  let expires = options.expires

  if (is.number(expires)) {
    expires = new Date(new Date().getTime() + (expires as number * 60 * 60 * 1000))
  }
  document.cookie = [
    encodeURIComponent(key), '=', encodeURIComponent(value),
    expires ? ';expires=' + (expires as Date).toUTCString() : '',
    options.path ? ';path=' + options.path : '',
    options.domain ? ';domain=' + options.domain : '',
    options.secure ? ';secure' : ''
  ].join('')
}

/**
 * 读取 cookie 的键值
 *
 * 如果不传 key，则返回完整的 cookie 键值对象
 *
 * @param key
 * @return
 */
export function get(key: string): string | Object | void {
  const result = parse(document.cookie)
  return is.string(key) ? result[key] : result
}

/**
 * 写入 cookie
 *
 * @param key 如果 key 是 string，则必须传 value 如果 key 是 Object，可批量写入
 * @param value
 * @param options
 * @param options.expires 过期小时数，如 1 表示 1 小时后过期
 * @param options.path
 * @param options.domain
 * @param options.secure
 */
export function set(
  key: string | Object,
  value?: any,
  options: {path?: string, domain?: string, secure?: boolean, expires?: number | Date} = {}
) {
  let opt = object.extend({}, defaultOptions)
  object.extend(opt, options)

  if (is.isPlainObject(key)) {
    object.each<any>(key as Object, (value, k) => {
      setCookie(k, value, opt)
    })
  }
  else {
    setCookie(key as string, value, opt)
  }
}

/**
 * 删除某个 cookie
 */
export function remove(
  key: string,
  options: {path?: string, domain?: string, secure?: boolean, expires?: number | Date} = {}
) {
  options.expires = -1
  let opt = object.extend({}, defaultOptions)
  object.extend(opt, options)
  setCookie(key, '', opt)
}

/**
 * @file url 操作
 */

import * as is from '../util/is'
import split from '../function/split'
import * as array from '../util/array'
import * as object from '../util/object'

/**
 * 把查询字符串解析成对象
 * @param queryStr 
 */
export function parseQuery(queryStr: string, separator: string = '&'): Record<string, string> {
  const result = {}
  if (is.string(queryStr) && queryStr.indexOf('=') >= 0) {
    let firstChar = queryStr.charAt(0)
    let startIndex = (firstChar === '?' || firstChar === '#') ? 1 : 0
    if (startIndex > 0) {
      queryStr = queryStr.substr(startIndex)
    }
    array.each(split(queryStr, separator), (item) => {
      let terms = item.split('=')
      if (terms.length === 2) {
        let key = terms[0]?.trim()
        if (key) {
          result[key] = decodeURIComponent(terms[1])
        }
      }
    })
  }
  return result
}

/**
 * 把对象序列化成查询字符串
 *
 * @param query
 * @return
 */
export function stringifyQuery(query: Record<string, string | number | boolean>, separator: string = '&'): string {
  const result = []
  if (is.isPlainObject(query)) {
    object.each<Record<string, string | number | boolean>>(query, (value, key) => {
      result.push(key + '=' + encodeURIComponent(is.object(value) ? JSON.stringify(value) : value))
    })
  }
  return result.join(separator)
}

/**
 * 解析 url，返回格式遵循 location 属性的命名
 * 
 * @param url 如果不传，使用当前地址
 */
export function parse(url: string) {

  const key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
  const parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/

  const result: Partial<any> = {}
  const m = parser.exec(url)
  let i = 14

  while (i--) {
    result[key[i]] = m[i] ?? ''
  }
  return {
    protocol: result.protocol as string,
    file: result.file as string,
    host: result.host as string,
    port: result.port as string,
    user: result.user as string,
    password: result.password as string,
    origin: `${result.protocol}://${result.authority}`,
    pathname: result.path as string,
    search: `?${result.query}`,
    hash: result.anchor ? `#${result.anchor}` : ''
  }
}

/**
 * 把参数混入一个 url
 * 
 * @param query 
 * @param url 
 * @param applyHash 
 */
export function mixin(query: Record<string, any>, applyHash: boolean, url?: string): string {
  if (url == null) {
    url = document.URL
  }

  let scheme = parse(url)
  let params = parseQuery(applyHash ? scheme.hash : scheme.search)
  object.extend(params, query)
  let paramStr = object.param(params)

  url = scheme.origin + scheme.pathname

  if (applyHash) {
    url += scheme.search
  }
  else if (paramStr) {
    url += '?' + paramStr
  }

  if (!applyHash) {
    url += scheme.hash
  }
  else if (paramStr) {
    url += '#' + paramStr
  }

  return url
}

const SLASH_DOT_REGEX = /(?:\/|^)\.(?=\/)/g
const SLASH_DOT_DOT_REGEX = /(?:\/|^)\.\.\/(?!\.\.\/)[^\/]*(?=\/)/g
const FIRST_SEGMENT_REGEX = /^(?=([^\/?#]*))\1([^]*)$/
const URL_REGEX = /^(?=((?:[a-zA-Z0-9+\-.]+:)?))\1(?=((?:\/\/[^\/?#]*)?))\2(?=((?:(?:[^?#\/]*\/)*[^;?#\/]*)?))\3((?:;[^?#]*)?)(\?[^#]*)?(#[^]*)?$/

function buildURLFromParts(parts: {
  scheme: string
  netLoc: string
  path: string
  params: string
  query: string
  fragment: string
}) {
  return (
    parts.scheme +
    parts.netLoc +
    parts.path +
    parts.params +
    parts.query +
    parts.fragment
  )
}

function parseURL(url: string) {
  const parts = URL_REGEX.exec(url)
  if (!parts) {
    return null
  }
  return {
    scheme: parts[1] || '',
    netLoc: parts[2] || '',
    path: parts[3] || '',
    params: parts[4] || '',
    query: parts[5] || '',
    fragment: parts[6] || ''
  }
}

export function normalizePath(path: string) {
  // The following operations are
  // then applied, in order, to the new path:
  // 6a) All occurrences of "./", where "." is a complete path
  // segment, are removed.
  // 6b) If the path ends with "." as a complete path segment,
  // that "." is removed.
  path = path.split('').reverse().join('').replace(SLASH_DOT_REGEX, '')
  // 6c) All occurrences of "<segment>/../", where <segment> is a
  // complete path segment not equal to "..", are removed.
  // Removal of these path segments is performed iteratively,
  // removing the leftmost matching pattern on each iteration,
  // until no matching pattern remains.
  // 6d) If the path ends with "<segment>/..", where <segment> is a
  // complete path segment not equal to "..", that
  // "<segment>/.." is removed.
  while (
    path.length !== (path = path.replace(SLASH_DOT_DOT_REGEX, '')).length
  ) {}
  return path.split('').reverse().join('')
}

/**
 * from https://github.com/tjenkinson/url-toolkit
 * 
 */
export function buildAbsoluteURL(baseURL: string, relativeURL: string, opts?: {
  alwaysNormalize?: boolean
}) {
  opts = opts || {}
  // remove any remaining space and CRLF
  baseURL = baseURL.trim()
  relativeURL = relativeURL.trim()
  if (!relativeURL) {
    // 2a) If the embedded URL is entirely empty, it inherits the
    // entire base URL (i.e., is set equal to the base URL)
    // and we are done.
    if (!opts.alwaysNormalize) {
      return baseURL
    }
    let basePartsForNormalize = parseURL(baseURL)
    if (!basePartsForNormalize) {
      throw new Error('Error trying to parse base URL.')
    }
    basePartsForNormalize.path = normalizePath(basePartsForNormalize.path)
    return buildURLFromParts(basePartsForNormalize)
  }
  let relativeParts = parseURL(relativeURL)
  if (!relativeParts) {
    throw new Error('Error trying to parse relative URL.')
  }
  if (relativeParts.scheme) {
    // 2b) If the embedded URL starts with a scheme name, it is
    // interpreted as an absolute URL and we are done.
    if (!opts.alwaysNormalize) {
      return relativeURL
    }
    relativeParts.path = normalizePath(relativeParts.path)
    return buildURLFromParts(relativeParts)
  }
  let baseParts = parseURL(baseURL)
  if (!baseParts) {
    throw new Error('Error trying to parse base URL.')
  }
  if (!baseParts.netLoc && baseParts.path && baseParts.path[0] !== '/') {
    // If netLoc missing and path doesn't start with '/', assume everything before the first '/' is the netLoc
    // This causes 'example.com/a' to be handled as '//example.com/a' instead of '/example.com/a'
    let pathParts = FIRST_SEGMENT_REGEX.exec(baseParts.path)
    baseParts.netLoc = pathParts[1]
    baseParts.path = pathParts[2]
  }
  if (baseParts.netLoc && !baseParts.path) {
    baseParts.path = '/'
  }
  const builtParts = {
    // 2c) Otherwise, the embedded URL inherits the scheme of
    // the base URL.
    scheme: baseParts.scheme,
    netLoc: relativeParts.netLoc,
    path: null,
    params: relativeParts.params,
    query: relativeParts.query,
    fragment: relativeParts.fragment,
  }
  if (!relativeParts.netLoc) {
    // 3) If the embedded URL's <net_loc> is non-empty, we skip to
    // Step 7.  Otherwise, the embedded URL inherits the <net_loc>
    // (if any) of the base URL.
    builtParts.netLoc = baseParts.netLoc
    // 4) If the embedded URL path is preceded by a slash "/", the
    // path is not relative and we skip to Step 7.
    if (relativeParts.path[0] !== '/') {
      if (!relativeParts.path) {
        // 5) If the embedded URL path is empty (and not preceded by a
        // slash), then the embedded URL inherits the base URL path
        builtParts.path = baseParts.path
        // 5a) if the embedded URL's <params> is non-empty, we skip to
        // step 7; otherwise, it inherits the <params> of the base
        // URL (if any) and
        if (!relativeParts.params) {
          builtParts.params = baseParts.params
          // 5b) if the embedded URL's <query> is non-empty, we skip to
          // step 7; otherwise, it inherits the <query> of the base
          // URL (if any) and we skip to step 7.
          if (!relativeParts.query) {
            builtParts.query = baseParts.query
          }
        }
      }
      else {
        // 6) The last segment of the base URL's path (anything
        // following the rightmost slash "/", or the entire path if no
        // slash is present) is removed and the embedded URL's path is
        // appended in its place.
        let baseURLPath = baseParts.path
        let newPath =
          baseURLPath.substring(0, baseURLPath.lastIndexOf('/') + 1) +
          relativeParts.path
        builtParts.path = normalizePath(newPath)
      }
    }
  }
  if (builtParts.path === null) {
    builtParts.path = opts.alwaysNormalize
      ? normalizePath(relativeParts.path)
      : relativeParts.path
  }
  return buildURLFromParts(builtParts)
}

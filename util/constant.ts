/**
 * @file 为了压缩，定义的常量
 */

export const TRUE = true
export const FALSE = false
export const NULL = null
export const UNDEFINED = void 0
export const MINUS_ONE = -1

export const RAW_TRUE = 'true'
export const RAW_FALSE = 'false'
export const RAW_NULL = 'null'
export const RAW_UNDEFINED = 'undefined'

export const RAW_THIS = 'this'
export const RAW_VALUE = 'value'
export const RAW_LENGTH = 'length'
export const RAW_FUNCTION = 'function'
export const RAW_WILDCARD = '*'
export const RAW_DOT = '.'
export const RAW_SLASH = '/'
export const RAW_TAG = 'tag'

export const KEYPATH_PARENT = '..'
export const KEYPATH_CURRENT = RAW_THIS

/**
 * Single instance for window in browser
 */
export const WINDOW: Window = typeof window !== RAW_UNDEFINED ? window : UNDEFINED

/**
 * Single instance for document in browser
 */
export const DOCUMENT = typeof document !== RAW_UNDEFINED ? document : UNDEFINED

/**
 * Single instance for global in nodejs or browser
 */
// @ts-ignore
export const GLOBAL: Window & NodeJS.Global = typeof globalThis !== RAW_UNDEFINED ? globalThis : (typeof global !== RAW_UNDEFINED ? global : WINDOW)

/**
 * Single instance for self in nodejs or browser
 */
// @ts-ignore
export const SELF: Window & NodeJS.Global = typeof self !== RAW_UNDEFINED ? self : GLOBAL

/**
 * Single instance for noop function
 */
export const EMPTY_FUNCTION = function () {
  /** common */
}

/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
export const EMPTY_OBJECT = Object.freeze({})

/**
 * 空数组
 */
export const EMPTY_ARRAY = Object.freeze([])

/**
 * 空字符串
 */
export const EMPTY_STRING = ''


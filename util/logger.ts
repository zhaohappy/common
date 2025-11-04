/**
 * @file 日志
 */

import * as constant from './constant'
import toString from '../function/toString'

export const TRACE = 0
export const DEBUG = 1
export const INFO = 2
export const WARN = 3
export const ERROR = 4
export const FATAL = 5

type defined<T extends string> = `defined(${T})`

const nativeConsole: Console | null = typeof console !== constant.RAW_UNDEFINED ? console : constant.NULL,

    /**
     * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
     */
    defaultLogLevel = /common/.test(toString(constant.EMPTY_FUNCTION)) ? INFO : WARN,

    /**
     * 日志打印函数
     */
    printLog = nativeConsole
      ? function (tag: string, msg: string) {
        nativeConsole.log(tag, msg)
      }
      : constant.EMPTY_FUNCTION,
    printWarn = nativeConsole
      ? function (tag: string, msg: string) {
        nativeConsole.warn(tag, msg)
      }
      : constant.EMPTY_FUNCTION,
    printError = nativeConsole
      ? function (tag: string, msg: string) {
        nativeConsole.error(tag, msg)
      }
      : constant.EMPTY_FUNCTION

/**
 * 全局调试开关
 */
function getLogLevel() {
  if (constant.GLOBAL) {
    const logLevel = constant.SELF['COMMON_LOG_LEVEL']
    if (logLevel >= TRACE && logLevel <= FATAL) {
      return logLevel as number
    }
  }
  return defaultLogLevel
}

/**
 * 设置日志输出级别
 * 
 * @param level 日志输出级别
 */
export function setLevel(level: number): void {
  constant.SELF['COMMON_LOG_LEVEL'] = level
}

/**
 * 打印 trace 日志
 *
 * @param msg
 */
export function trace(msg: string, file: string, line: number): void
export function trace<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function trace(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= TRACE) {
    printLog(`[${arguments[1]}][line ${arguments[2]}] [trace]`, msg)
  }
}

/**
 * 打印 debug 日志
 *
 * @param msg
 */
export function debug(msg: string, file: string, line: number): void
export function debug<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function debug(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= DEBUG) {
    printLog(`[${arguments[1]}][line ${arguments[2]}] [debug]`, msg)
  }
}

/**
 * 打印 info 日志
 *
 * @param msg
 */
export function info(msg: string, file: string, line: number): void
export function info<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function info(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= INFO) {
    printLog(`[${arguments[1]}][line ${arguments[2]}] [info]`, msg)
  }
}

/**
 * 打印 warn 日志
 *
 * @param msg
 */
export function warn(msg: string, file: string, line: number): void
export function warn<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function warn(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= WARN) {
    printWarn(`[${arguments[1]}][line ${arguments[2]}] [warn]`, msg)
  }
}

/**
 * 打印 error 日志
 *
 * @param msg
 */
export function error(msg: string, file: string, line: number): void
export function error<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function error(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= ERROR) {
    printError(`[${arguments[1]}][line ${arguments[2]}] [error]`, msg)
  }
}

/**
 * 致命错误，中断程序
 *
 * @param msg
 */
export function fatal(msg: string, file: string, line: number): void
export function fatal<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(msg: string): void
export function fatal(msg: string, file?: string, line?: number): void {
  if (getLogLevel() <= FATAL) {
    error(msg, file, line)
    throw new Error(`[${arguments[1]}][line ${arguments[2]}] [fatal]: ${msg}`)
  }
}

/**
 * 根据日志等级打印
 * 
 * @param level 
 * @param msg 
 * @param tag 
 */
export function log(level: number, msg: string, file: string, line: number): void
export function log<args = [defined<'__FILE__'>, defined<'__LINE__'>], enableArgs=defined<'ENABLE_LOG_PATH'>>(level: number, msg: string): void
export function log(level: number, msg: string, file?: string, line?: number): void {
  if (level === TRACE) {
    trace(msg, arguments[2], arguments[3])
  }
  else if (level === DEBUG) {
    debug(msg, arguments[2], arguments[3])
  }
  else if (level === INFO) {
    info(msg, arguments[2], arguments[3])
  }
  else if (level === WARN) {
    warn(msg, arguments[2], arguments[3])
  }
  else if (level === ERROR) {
    error(msg, arguments[2], arguments[3])
  }
  else if (level === FATAL) {
    fatal(msg, arguments[2], arguments[3])
  }
}

/**
 * @hidden
 * 是否上传，全局配置
 */
let enableUpload: boolean = true

/**
 * @hidden
 * 日志上传等级，全局配置
 */
let uploadLevel: number = WARN

/**
 * 打开日志上传
 * 
 */
export function enableUploadLog(): void {
  enableUpload = true
}

/**
 * 关闭日志上传
 */
export function disableUploadLog(): void {
  enableUpload = false
}

/**
 * 是否可以上传日志
 */
export function canUploadLog() {
  return enableUpload
}

/**
 * 设置日志上传等级
 */
export function setUploadLevel(level: number) {
  uploadLevel = level
}

/**
 * 获取日志上传等级
 */
export function getUploadLevel() {
  return uploadLevel
}

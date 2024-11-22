
import * as logger from '../util/logger'
import * as object from '../util/object'

type Options = {
  uploadLevel?: number
  onUpload?: (log: string, level: number) => void
}

type defined<T extends string> = `defined(${T})`

export default class Logger {

  private options: Options

  private canUpload: boolean

  public TRACE = logger.TRACE

  public DEBUG = logger.DEBUG

  public INFO = logger.INFO

  public WARN = logger.WARN

  public ERROR = logger.ERROR

  public FATAL = logger.FATAL

  constructor(options: Options = {}) {
    this.options = object.extend({
      uploadLevel: logger.getUploadLevel()
    }, options)

    this.canUpload = true
  }

  public enableUploadLog(): void {
    this.canUpload = true
  }

  public disableUploadLog(): void {
    this.canUpload = false
  }

  public setUploadLevel(level: number) {
    this.options.uploadLevel = level
  }

  public fatal(msg: string, upload: boolean, file: string, line: number): void
  public fatal<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public fatal(msg: string, upload: boolean = false, file?: string, line?: number): void {
    if ((logger.FATAL >= this.options.uploadLevel || upload)
            && this.canUpload
            && this.options.onUpload
            && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.FATAL)
    }

    logger.fatal(msg, arguments[2], arguments[3])
  }

  public error(msg: string, upload: boolean, file: string, line: number): void
  public error<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public error(msg: string, upload: boolean = false, file?: string, line?: number): void {
    logger.error(msg, arguments[2], arguments[3])

    if ((logger.ERROR >= this.options.uploadLevel || upload)
      && this.canUpload
      && this.options.onUpload
      && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.ERROR)
    }
  }

  public warn(msg: string, upload: boolean, file: string, line: number): void
  public warn<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public warn(msg: string, upload: boolean = false, file?: string, line?: number): void {
    logger.warn(msg, arguments[2], arguments[3])

    if ((logger.WARN >= this.options.uploadLevel || upload)
      && this.canUpload
      && this.options.onUpload
      && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.WARN)
    }
  }

  public info(msg: string, upload: boolean, file: string, line: number): void
  public info<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public info(msg: string, upload: boolean = false, file?: string, line?: number): void  {
    logger.info(msg, arguments[2], arguments[3])

    if ((logger.INFO >= this.options.uploadLevel || upload)
      && this.canUpload
      && this.options.onUpload
      && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.INFO)
    }
  }

  public debug(msg: string, upload: boolean, file: string, line: number): void
  public debug<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public debug(msg: string, upload: boolean = false, file?: string, line?: number): void {
    logger.debug(msg, arguments[2], arguments[3])

    if ((logger.DEBUG >= this.options.uploadLevel || upload)
      && this.canUpload
      && this.options.onUpload
      && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.DEBUG)
    }
  }

  public trace(msg: string, upload: boolean, file: string, line: number): void
  public trace<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(msg: string, upload?: boolean): void
  public trace(msg: string, upload: boolean = false, file?: string, line?: number): void {
    logger.trace(msg, arguments[2], arguments[3])

    // trace 等级必须指定上传才能上传，一个是日志量太大，一个是可能会发生循环日志的风险
    if ((logger.TRACE >= this.options.uploadLevel && upload)
      && this.canUpload
      && this.options.onUpload
      && logger.canUploadLog()
    ) {
      this.options.onUpload(`[${arguments[2]}][line ${arguments[3]}] ${msg}`, logger.TRACE)
    }
  }

  public log(log: string, level: number, upload: boolean, file: string, line: number): void
  public log<args = [defined<'__FILE__'>, defined<'__LINE__'>]>(log: string, level: number, upload?: boolean): void
  public log(log: string, level: number, upload: boolean = false, file?: string, line?: number): void {
    switch (level) {
      case logger.TRACE:
        this.trace(log, upload, arguments[2], arguments[3])
        break
      case logger.DEBUG:
        this.debug(log, upload, arguments[2], arguments[3])
        break
      case logger.INFO:
        this.info(log, upload, arguments[2], arguments[3])
        break
      case logger.WARN:
        this.warn(log, upload, arguments[2], arguments[3])
        break
      case logger.ERROR:
        this.error(log, upload, arguments[2], arguments[3])
        break
      case logger.FATAL:
        this.fatal(log, upload, arguments[2], arguments[3])
        break
      default:
        this.debug(log, upload, arguments[2], arguments[3])
    }
  }
}

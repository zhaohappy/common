import isWorker from '../function/isWorker'
import getTimestamp from '../function/getTimestamp'
import WorkerSetTimeout from './WorkerSetTimeout'
import debounce from '../function/debounce'


let workerSetTimeout: WorkerSetTimeout
let workerSetTimeoutCounter = 0

function createWorkerSetTimeout() {
  if (workerSetTimeout) {
    workerSetTimeoutCounter++
    return workerSetTimeout
  }
  workerSetTimeout = new WorkerSetTimeout()
  workerSetTimeoutCounter = 1
  return workerSetTimeout
}

function deleteWorkerSetTimeout() {

  if (workerSetTimeoutCounter === 0) {
    return
  }

  workerSetTimeoutCounter--
  if (workerSetTimeoutCounter === 0) {
    workerSetTimeout.destroy()
    workerSetTimeout = null
  }
}

export default class Clock {

  private messageChannel: MessageChannel

  private interval: number

  private started: boolean

  private timer: number
  private workerTimer: number

  private workerSetTimeout: WorkerSetTimeout

  public onClock: (next: () => void) => void

  private nextTick: () => void

  /**
   * messageChannel 执行间隔，默认 0.2
   */
  private a: number

  /**
   * setTimeout 最小执行间隔，默认 4
   */
  private b: number

  /**
   * 50 毫秒内  messageChannel 执行次数
   */
  private beta: number

  /**
   * 50 毫秒内  setTimeout 执行次数
   */
  private alpha: number

  private count: number

  /**
   * 等效时间
   */
  private equivalent: number

  private timestamp: number

  private onVisibilityChange: (event: any) => void

  private timeoutNext: Function

  private running: boolean

  private highPerformance: boolean

  private forceWorker: boolean

  constructor(interval: number, highPerformance = true, forceWorker: boolean = false) {
    this.started = false
    this.interval = interval
    this.highPerformance = highPerformance
    this.forceWorker = forceWorker

    this.a = 0.2
    this.b = 4
    this.equivalent = 50
    this.timestamp = 0

    this.nextTick = () => {
      if (!this.started || this.running) {
        return
      }

      this.running = true

      if (this.interval >= 4 || !this.highPerformance) {
        this.timeoutTick()
      }
      else if (this.interval <= 0) {
        this.messageChannel.port1.postMessage(null)
      }
      else {
        const now = getTimestamp()
        if (now - this.timestamp > this.equivalent) {
          this.count = 0
          this.timestamp = now
        }

        if (this.count < this.beta) {
          this.messageChannel.port1.postMessage(null)
        }
        else {
          this.timeoutTick()
        }
      }
    }

    this.compute()

    this.messageChannel = new MessageChannel()
    this.handleEvent()

    this.timeoutNext = (worker: boolean) => {
      if (worker) {
        this.workerTimer = null
      }
      else {
        this.timer = null
      }
      this.running = false

      this.count++

      if (this.onClock) {
        this.onClock(this.nextTick)
      }
      else {
        this.nextTick()
      }
    }

    if (!isWorker() && document.visibilityState === 'hidden') {
      this.workerSetTimeout = createWorkerSetTimeout()
    }

    this.running = false
  }

  private compute(clear: boolean = true) {
    if (this.interval > 0) {
      this.beta = Math.ceil(this.equivalent * (1 - this.b / this.interval) / (this.a - this.b))
      this.alpha = Math.floor(this.equivalent / this.interval - this.beta)

      if (clear) {
        this.count = 0
      }
    }
  }

  private timeoutTick() {
    if (this.workerSetTimeout
      && document.visibilityState === 'hidden'
      && (this.interval < 1000 || this.forceWorker)
    ) {
      this.workerTimer = this.workerSetTimeout.setTimeout(this.timeoutNext, this.interval)
    }
    else {
      this.timer = setTimeout(this.timeoutNext, this.interval)
    }
  }

  public start() {
    if (this.started) {
      return
    }
    this.started = true
    this.timestamp = getTimestamp()

    this.nextTick()
  }

  public stop() {
    this.started = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.workerTimer && this.workerSetTimeout) {
      this.workerSetTimeout.clearTimeout(this.workerTimer)
    }
    this.running = false
  }

  public isStarted() {
    return this.started
  }

  public setInterval(interval: number) {
    this.interval = Math.max(interval, 0)
    this.compute()
  }

  public getInterval() {
    return this.interval
  }

  public isZeroTimeout() {
    return this.interval < 4
  }

  public destroy() {
    this.stop()

    if (this.workerSetTimeout) {
      deleteWorkerSetTimeout()
      this.workerSetTimeout = null
    }

    if (this.onVisibilityChange) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
      this.onVisibilityChange = null
    }
  }

  private handleEvent() {
    this.messageChannel.port2.onmessage = () => {
      if (!this.started) {
        return
      }
      this.running = false
      this.count++
      if (this.onClock) {
        this.onClock(this.nextTick)
      }
      else {
        this.nextTick()
      }
    }

    if (!isWorker()) {
      this.onVisibilityChange = debounce((event) => {
        if (document.visibilityState === 'hidden') {

          this.workerSetTimeout = createWorkerSetTimeout()

          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
            this.running = false
          }

          this.nextTick()
        }
        else {

          if (this.workerTimer) {
            this.workerSetTimeout.clearTimeout(this.workerTimer)
            this.workerTimer = null
            this.running = false
          }

          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
            this.running = false
          }

          deleteWorkerSetTimeout()
          this.workerSetTimeout = null

          this.nextTick()
        }
      }, 20)
      document.addEventListener('visibilitychange', this.onVisibilityChange)
    }
  }
}

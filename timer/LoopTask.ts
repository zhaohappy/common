/**
 * @file 可伸缩循环任务队列
 */

import Clock from './Clock'
import getTimestamp from '../function/getTimestamp'
import type { Timeout } from '../types/type'

export default class LoopTask {

  private task: () => any

  private count: number

  private emptyCount: number

  private started: boolean

  private clock: Clock

  private timestamp: number

  private timeout: number

  private interval: number

  private startTimer: Timeout

  private autoInterval: boolean

  private sync: boolean

  private tickAfter: () => void

  private processing: boolean

  constructor(task: () => any, timeout: number = 0, interval: number = 0, autoInterval: boolean = true, sync: boolean = true) {
    this.task = task
    this.timeout = timeout
    this.interval = interval
    this.autoInterval = autoInterval
    this.sync = sync

    this.count = 0
    this.emptyCount = 0
    this.timestamp = 0
    this.started = false
    this.processing = false

    this.clock = new Clock(this.interval)

    this.clock.onClock = (next) => {
      if (!this.started) {
        return
      }
      this.count++

      if (this.sync) {
        if (this.tickAfter) {
          this.tickAfter()
          this.tickAfter = null
        }
        if (this.task() === false) {
          this.stop()
        }
        else {
          this.next(next)
        }
      }
      else {
        if (this.processing) {
          return
        }
        this.processing = true
        this.task().then((result: any) => {
          this.processing = false
          if (this.tickAfter) {
            this.tickAfter()
            this.tickAfter = null
          }
          if (result === false) {
            this.stop()
          }
          else {
            this.next(next)
          }
        })
      }
    }
  }

  private next(next: () => void) {
    if (!this.started) {
      return
    }
    const now = getTimestamp()
    if (this.autoInterval && now - this.timestamp > 50) {
      const load = this.emptyCount / this.count
      /**
       * 1000 毫秒被空闲任务调用超过 10%，将间隔减一
       * 没有空闲任务，将间隔重新置为 0
       */
      if (this.emptyCount === 0) {
        this.clock.setInterval(Math.max(this.clock.getInterval() >> 1, this.interval))
      }
      else if (load < 0.1) {
        this.clock.setInterval(this.clock.getInterval() - 1)
      }
      else if (load > 0.2) {
        this.clock.setInterval(Math.min(this.clock.getInterval() + 1, 20))
      }
      else if (load > 0.5) {
        this.clock.setInterval(this.clock.getInterval() << 1)
      }
      this.count = 0
      this.emptyCount = 0
      this.timestamp = now
    }
    next()
  }

  public start() {
    this.started = true
    if (this.timeout) {
      this.startTimer = setTimeout(() => {
        this.count = 0
        this.emptyCount = 0
        this.timestamp = getTimestamp()
        this.clock.start()
        this.startTimer = null
      }, this.timeout)
    }
    else {
      this.count = 0
      this.emptyCount = 0
      this.timestamp = getTimestamp()
      this.clock.start()
    }
  }

  public stop() {
    this.started = false
    this.processing = false
    if (this.startTimer) {
      clearTimeout(this.startTimer)
      this.startTimer = null
    }
    this.clock.stop()
  }

  public async stopBeforeNextTick() {
    if (this.startTimer) {
      clearTimeout(this.startTimer)
      this.startTimer = null
    }

    if (!this.clock.isStarted()) {
      return
    }

    if (this.sync) {
      this.started = false
      this.processing = false
      this.clock.stop()
    }
    else {
      return new Promise<void>((resolve) => {
        this.tickAfter = () => {
          this.started = false
          this.processing = false
          this.clock.stop()
          resolve()
        }
      })
    }
  }

  public isStarted() {
    return this.started
  }

  public emptyTask() {
    this.emptyCount++
  }

  public isZeroTimeout() {
    return this.clock?.isZeroTimeout()
  }

  public restart() {
    if (this.clock) {
      this.stop()
      this.clock.setInterval(this.interval)
      this.start()
    }
  }

  public resetInterval() {
    this.clock.setInterval(Math.max(this.clock.getInterval() >> 1, this.interval))
    this.emptyCount = 0
    this.count = 0
    this.timestamp = getTimestamp()
  }

  public destroy() {
    this.stop()
    this.task =  null
    this.timeout = null
    this.interval = null
  }
}

/**
 * @file worker 定时任务，规避后台 settimeout 最小间隔 1s 的问题
 */

import type { Timeout } from '../types/type'
import Clock from './Clock'

export default class WorkerTimer {

  private task: Function

  private timeout: number

  private interval: number

  private clock: Clock

  private started: boolean

  private timer: Timeout

  constructor(task: Function, timeout: number, interval: number) {
    this.task = task
    this.timeout = timeout
    this.interval = interval

    this.started = false

    this.clock = new Clock(this.interval, false, true)

    this.clock.onClock = (next) => {
      if (this.started && this.task() === false) {
        this.stop()
      }
      else {
        next()
      }
    }
  }

  public start() {
    this.started = true

    if (this.timeout > 0) {
      this.timer = setTimeout(() => {
        this.timer = null
        this.clock.start()
      }, this.timeout)
    }
    else {
      this.clock.start()
    }

  }

  public stop() {
    this.started = false
    this.clock.stop()

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  public isStarted() {
    return this.started
  }

  public updateInterval(interval: number) {
    this.interval = interval
    this.clock.setInterval(interval)
  }

  public destroy() {
    if (this.clock) {
      this.stop()
      this.clock.destroy()
      this.clock = null
    }

    this.started = false

    this.task = this.timeout = this.interval = null
  }
}

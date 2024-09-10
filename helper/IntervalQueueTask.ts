/**
 * 以一定间隔执行任务
 */

import * as is from '../util/is'
import Timer from '../timer/Timer'
import getTimestamp from '../function/getTimestamp'


export default class IntervalQueueTask {

  private queue: (() => void)[]
  private timer: Timer
  private ended: boolean
  onEnd: () => void

  private lastTime: number
  private interval: number

  constructor(interval: number, timeout: number = 0) {
    this.queue = []
    this.interval = interval
    this.timer = new Timer(() => {
      if (this.queue.length) {
        this.queue.shift()()
      }
      else if (this.ended) {
        if (this.onEnd) {
          this.onEnd()
        }
        this.timer.stop()
      }
      else {
        this.lastTime = getTimestamp()
      }
    }, timeout, interval)
  }

  public push<T extends (() => void)>(task: T) {
    if (!is.func(task)) {
      throw new TypeError('task must be a function')
    }
    this.ended = false

    const now = getTimestamp()

    if (this.timer.isStarted() && !this.queue.length && (now - this.lastTime > this.interval)) {
      task()
      this.lastTime = now
    }
    else {
      this.queue.push(task)
      if (this.queue.length === 1 && !this.timer.isStarted()) {
        this.timer.start()
      }
    }
    
  }

  public end() {
    this.ended = true
  }

  public reset() {
    this.timer.stop()
    this.queue.length = 0
  }
}

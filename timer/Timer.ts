/**
 * @file 定时任务
 */

import { Timeout } from '../types/type'

export default class Timer {

  private task: Function

  private timeout: number

  private interval: number

  private timer: Timeout

  /**
   * 
   * @param task 定时任务
   * @param timeout 多久之后开始
   * @param interval 执行间隔
   */
  constructor(task: Function, timeout: number, interval: number) {
    this.task = task
    this.timeout = timeout
    this.interval = interval
  }

  /**
   * 开始执行
   */
  public start() {
    const me = this
    me.stop()

    let timeout = me.timeout
    const interval = me.interval

    const next = function () {
      if (me.task() !== false
        && me.timer
      ) {
        me.timer = setTimeout(next, me.interval)
      }
      else {
        me.stop()
      }
    }
    if (timeout == null) {
      timeout = interval
    }
    me.timer = setTimeout(next, timeout)
  }

  /**
   * 停止执行
   */
  public stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  public updateInterval(interval: number) {
    this.interval = interval
  }

  /**
   * 是否正在执行
   */
  public isStarted() {
    return !!this.timer
  }

  /**
   * 销毁定时任务
   */
  public destroy() {
    this.stop()
    this.task = this.timeout = this.interval = null
  }
}

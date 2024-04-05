/**
 * @file sleep
 */

import { Timeout } from '../types/type'

export default class Sleep {

  private timeout: number

  private timer: Timeout

  private resolve: (value?: number) => void

  private reject: (value?: number) => void

  private startTime: number

  /**
   * 
   * @param timeout 时间（秒）
   */
  constructor(timeout: number) {
    this.timeout = timeout
  }

  public then(res: (value?: number) => void, rej?: (value?: number) => void) {
    this.resolve = res
    this.reject = rej
    this.startTime = Date.now()
    this.timer = setTimeout(() => {
      this.resolve(Date.now() - this.startTime)
      this.timer = null
    }, this.timeout * 1000)
  }

  public stop(resolve: boolean = true) {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
      if (this.resolve && resolve) {
        this.resolve(Date.now() - this.startTime)
      }
      else if (this.reject && !resolve) {
        this.reject(Date.now() - this.startTime)
      }
    }
  }

  public reset(timeout?: number) {

    if (timeout) {
      this.timeout = timeout
    }

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.resolve(Date.now() - this.startTime)
        this.timer = null
      }, this.timeout * 1000)
    }
  }
}


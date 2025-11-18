
export default class AnimationFrameLoop {
  private task: Function

  private timer: number

  private started: boolean

  /**
   * 
   * @param task 定时任务
   * @param timeout 多久之后开始
   * @param interval 执行间隔
   */
  constructor(task: Function) {
    this.task = task
    this.started = false
  }

  /**
   * 开始执行
   */
  public start() {
    const me = this
    me.stop()

    this.started = true

    const run = (timestamp: number) => {
      if (!this.started || this.task() === false) {
        return
      }
      this.timer = requestAnimationFrame(run)
    }

    this.timer = requestAnimationFrame(run)
  }

  /**
   * 停止执行
   */
  public stop() {
    this.started = false
    if (this.timer) {
      cancelAnimationFrame(this.timer)
      this.timer = null
    }
  }

  /**
   * 是否正在执行
   */
  public isStarted() {
    return this.started
  }

  /**
   * 销毁定时任务
   */
  public destroy() {
    this.stop()
    this.task = null
  }
}

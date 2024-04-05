/**
 * @file 异步任务队列
 */

import * as array from '../util/array'
import { Task, Fn } from '../types/type'
import execute from '../function/execute'
import nextTick from '../function/nextTick'

let shared: NextTask | void

export default class NextTask {

  /**
   * 全局单例
   */
  public static shared(): NextTask {
    return shared || (shared = new NextTask())
  }

  /**
   * 异步队列
   */
  tasks: Task[]

  constructor() {
    this.tasks = []
  }

  /**
   * 在队尾添加异步任务
   */
  append(func: Fn, context?: any): void {
    const instance = this, { tasks } = instance
    array.push(
      tasks,
      {
        fn: func,
        ctx: context
      }
    )
    if (tasks.length === 1) {
      nextTick(function () {
        instance.run()
      })
    }
  }

  /**
   * 在队首添加异步任务
   */
  prepend(func: Fn, context?: any): void {
    const instance = this, { tasks } = instance
    array.unshift(
      tasks,
      {
        fn: func,
        ctx: context
      }
    )
    if (tasks.length === 1) {
      nextTick(function () {
        instance.run()
      })
    }
  }

  /**
   * 清空异步队列
   */
  clear(): void {
    this.tasks.length = 0
  }

  /**
   * 立即执行异步任务，并清空队列
   */
  run(): void {
    const { tasks } = this
    if (tasks.length) {
      this.tasks = []
      array.each(
        tasks,
        function (task) {
          execute(task.fn, task.ctx)
        }
      )
    }
  }

}

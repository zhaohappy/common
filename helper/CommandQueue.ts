/**
 * 顺序执行异步任务，用于有顺序依赖的信令交互
 */

import * as is from '../util/is'
import * as array from '../util/array'

type Command = {
  task: () => Promise<any>
  resolve: (value: any) => void
  reject: (reason?: any) => void,
  error?: Error
}

export default class CommandQueue {

  private queue: Command[]

  constructor() {
    this.queue = []
  }

  private async execute(command: Command) {
    try {
      const result = await command.task()
      command.resolve(result)
    }
    catch (error) {
      command.reject(error)
    }
  }

  private async next() {
    if (this.queue.length) {
      const command = this.queue[0]
      if (command.error) {
        command.reject(command.error)
      }
      else {
        await this.execute(command)
      }

      this.queue.shift()

      if (this.queue.length) {
        this.next()
      }
    }
  }

  public async push<T extends() => Promise<any>>(task: T): Promise<ReturnType<T>> {
    if (!is.func(task)) {
      throw new TypeError('task must be a function')
    }

    return new Promise((resolve, reject) => {
      const command = {
        task,
        resolve,
        reject
      }
      this.queue.push(command)

      if (this.queue.length === 1) {
        this.next()
      }
    })
  }

  public clear(error?: Error) {
    array.each(this.queue, (command) => {
      command.error = error || new Error('command queue clear')
    })
  }
}

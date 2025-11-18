function workerTimeout(self: Worker) {
  self.addEventListener('message', (message) => {
    const origin = message.data
    let data = origin.data
    setTimeout(() => {
      self.postMessage({
        type: 'pong',
        id: data.id
      })
    }, Math.max(data.timeout ?? 0, 4))
  })
}

export default class WorkerSetTimeout {

  private worker: Worker

  private workerUrl: string

  private taskMap: Map<number, Function>

  private id: number

  constructor() {

    this.id = 0
    this.taskMap = new Map()

    const workerSource = `
      ${workerTimeout.toString()}
      ${workerTimeout.name}(self)
    `

    const blob = new Blob([workerSource], { type: 'text/javascript' })
    this.workerUrl = URL.createObjectURL(blob)

    this.worker = new Worker(this.workerUrl)

    this.worker.addEventListener('message', (message) => {
      const origin = message.data
      const type = origin.type
      const id = origin.id
      switch (type) {
        case 'pong':
          const task = this.taskMap.get(id)
          if (task) {
            task(true)
          }
          break
      }
    })
  }

  public setTimeout(task: Function, timeout: number = 0) {
    const id = this.id++

    this.taskMap.set(id, task)

    this.worker.postMessage({
      type: 'ping',
      data: {
        timeout,
        id
      }
    })

    return id
  }

  public clearTimeout(id: number) {
    this.taskMap.delete(id)
  }

  public destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl)
      this.workerUrl = null
    }

    if (this.taskMap) {
      this.taskMap.clear()
      this.taskMap = null
    }
  }
}

import * as logger from '../util/logger'

class WorkerSetTimeout {

  private worker: Worker

  constructor(self: Worker) {
    this.worker = self
    this.handleEvents()
  }

  handleEvents() {
    this.worker.addEventListener('message', (message) => {
      const origin = message.data
      let data = origin.data

      setTimeout(() => {
        this.worker.postMessage({
          type: 'pong',
          id: data.id
        })
      }, Math.max(data.timeout ?? 0, 4))
    })
  }
}

export default function run(self: Worker) {
  try {
    new WorkerSetTimeout(self)
  }
  catch (error) {
    logger.error('new WorkerSetTimeout failed')
  }
}



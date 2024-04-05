import Timer from './Timer'
import * as logger from '../util/logger'

class WorkerClock {

  private worker: Worker

  private timer: Timer

  constructor(self: Worker) {
    this.worker = self
    this.handleEvents()
  }

  handleEvents() {
    this.worker.addEventListener('message', (message) => {
      const origin = message.data
      let type = origin.type
      let data = origin.data
      switch (type) {
        case 'start':
          if (this.timer) {
            this.timer.destroy()
          }
          this.timer = new Timer(() => {
            this.worker.postMessage({
              type: 'clock'
            })
          }, data.timeout ?? 0, data.interval ?? 0)
          this.timer.start()
          break
        case 'stop':
          if (this.timer) {
            this.timer.destroy()
            this.timer = null
          }
      }
    })
  }
}

export default function (self: Worker) {
  try {
    new WorkerClock(self)
  }
  catch (error) {
    logger.error('new WorkerClock failed')
  }
}

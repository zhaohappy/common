import { Data } from '../types/type'
import Emitter from '../event/Emitter'
import isDef from '../function/isDef'

export const NOTIFY = 'notify'

export const REQUEST = 'request'

export interface RpcMessage {
  id?: number | string
  method?: string
  params?: Data
  error?: Data
  result?: Data
  seq?: number
}


export default class IPCPort extends Emitter {

  private port: MessagePort

  private requestMap: Map<number, {
    resolve: (value: any) => void
    reject: (value: any) => void
  }>

  private seq: number

  public closed: boolean

  constructor(port: MessagePort) {
    super(true)
    this.port = port

    this.handle()

    this.seq = 0
    this.requestMap = new Map()

    this.port.start()

    this.closed = false
  }

  private handle() {
    this.port.onmessage = (event) => {
      const origin = event.data
      const type = origin.type
      const data = origin.data

      if (type === 'notify') {
        this.fire(NOTIFY, data)
      }
      else if (type === 'reply') {
        const request = this.requestMap.get(data.seq)
        if (request) {
          if (isDef(data.result)) {
            request.resolve(data.result)
          }
          else if (data.error) {
            request.reject(data.error)
          }
          else {
            request.resolve(undefined)
          }
          this.requestMap.delete(data.seq)
        }
      }
      else if (type === 'request') {
        this.fire(REQUEST, data)
      }
    }
  }

  public notify(method: string, params: Data = {}, transfer: any[] = []) {
    this.port.postMessage({
      type: 'notify',
      data: {
        method,
        params
      }
    }, transfer)
  }

  public async request<T>(method: string, params: Data = {}, transfer: any[] = []) {
    return new Promise<T>((resolve, reject) => {

      const id = this.seq++

      this.requestMap.set(id, {
        resolve,
        reject
      })

      this.port.postMessage({
        type: 'request',
        data: {
          seq: id,
          method,
          params
        }
      }, transfer)
    })
  }

  public reply(request: RpcMessage, result?: any, error?: Data, transfer: any[] = []) {

    const data: Data = {
      seq: request.seq
    }

    if (isDef(result)) {
      data.result = result
    }
    else if (error) {
      data.error = error
    }

    if (transfer?.length) {
      this.port.postMessage({
        type: 'reply',
        data
      }, transfer)
    }
    else {
      this.port.postMessage({
        type: 'reply',
        data
      })
    }
  }

  public getPort() {
    return this.port
  }

  public destroy() {
    if (this.requestMap.size) {
      this.requestMap.forEach((req) => {
        req.reject('ipc port close')
      })
      this.requestMap.clear()
    }
    if (this.port) {
      this.port.close()
      this.port = null
    }
    this.closed = true
  }
}

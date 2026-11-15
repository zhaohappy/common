import type { Data } from '../types/type'
import Emitter from '../event/Emitter'
import isDef from '../function/isDef'

export const NOTIFY = 'notify'

export const REQUEST = 'request'

export interface IPCPortRequestOptions {
  timeoutMs?: number
}

export interface RpcMessage {
  id?: number | string
  method?: string
  params?: Data
  error?: Data
  result?: Data
  seq?: number
}


export default class IPCPort extends Emitter {

  protected port: MessagePort

  private requestMap: Map<number, {
    resolve: (value: any) => void
    reject: (value: any) => void
    timer?: ReturnType<typeof setTimeout>
  }>

  private seq: number

  public closed: boolean

  constructor(port: MessagePort) {
    super(true)
    this.port = port

    this.port.onmessage = this.handle.bind(this)

    this.seq = 0
    this.requestMap = new Map()

    this.port.start()

    this.closed = false
  }

  protected handle(event: MessageEvent<any>) {
    const origin = event.data
    const type = origin.type
    const data = origin.data

    if (type === 'notify') {
      this.fire(NOTIFY, data)
    }
    else if (type === 'reply') {
      const request = this.requestMap.get(data.seq)
      if (request) {
        if (request.timer !== undefined) {
          clearTimeout(request.timer)
        }
        this.requestMap.delete(data.seq)
        if (isDef(data.result)) {
          request.resolve(data.result)
        }
        else if (data.error) {
          request.reject(data.error)
        }
        else {
          request.resolve(undefined)
        }
      }
    }
    else if (type === 'request') {
      this.fire(REQUEST, data)
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

  public async request<T>(method: string, params: Data = {}, transfer: any[] = [], options: IPCPortRequestOptions = {}) {
    if (options.timeoutMs !== undefined
      && (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0 || options.timeoutMs > 2147483647)
    ) {
      throw new RangeError('timeoutMs must be an integer between 1 and 2147483647')
    }
    if (options.timeoutMs !== undefined && (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function')) {
      throw new Error('IPC deadline timers unavailable')
    }
    return new Promise<T>((resolve, reject) => {
      if (this.closed) {
        reject(new Error('ipc port close'))
        return
      }

      const id = this.seq++

      const request = {
        resolve,
        reject,
        timer: undefined as ReturnType<typeof setTimeout> | undefined
      }
      this.requestMap.set(id, request)
      if (options.timeoutMs !== undefined) {
        request.timer = setTimeout(() => {
          this.requestMap.delete(id)
          reject(new Error('ipc request timed out'))
        }, options.timeoutMs)
      }

      try {
        this.port.postMessage({
          type: 'request',
          data: {
            seq: id,
            method,
            params
          }
        }, transfer)
      }
      catch (error) {
        if (request.timer !== undefined) {
          clearTimeout(request.timer)
        }
        this.requestMap.delete(id)
        reject(error)
      }
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
        if (req.timer !== undefined) {
          clearTimeout(req.timer)
        }
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

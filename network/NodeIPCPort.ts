import IPCPort from './IPCPort'

export default class NodeIPCPort extends IPCPort {
  constructor(port: MessagePort) {
    super(port)
    // @ts-ignore
    this.port.on('message', this.handle.bind(this))
  }
}

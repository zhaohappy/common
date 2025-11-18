class FakeMessageChannelPort extends EventTarget {

  public peer: FakeMessageChannelPort

  public postMessage(message: any, transfer?: Transferable[]) {
    if (this.peer?.onmessage) {
      this.peer.onmessage({
        data: message
      } as any)
    }
  }

  public onmessage: (this: FakeMessageChannelPort, ev: MessageEvent<any>) => any

  public onmessageerror: (this: FakeMessageChannelPort, ev: MessageEvent<any>) => any

  public close() {
    this.peer = null
  }

  public start() {

  }
}

export default class FakeMessageChannel {

  public port1: FakeMessageChannelPort
  public port2: FakeMessageChannelPort

  constructor() {
    this.port1 = new FakeMessageChannelPort()
    this.port2 = new FakeMessageChannelPort()
    this.port1.peer = this.port2
    this.port2.peer = this.port1
  }
}

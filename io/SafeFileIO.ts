import FileIO from './FileIO'
import CommandQueue from '../helper/CommandQueue'

export default class SafeFileIO extends FileIO {

  private commandQueue: CommandQueue

  constructor(handler: FileHandle, append: boolean = false) {
    super(handler, append)
    this.commandQueue = new CommandQueue()
  }

  public async write(data: ArrayBuffer | ArrayBufferView) {
    return this.commandQueue.push(async () => {
      return super.write(data)
    })
  }

  public async seek(position: number) {
    return this.commandQueue.push(async () => {
      return super.seek(position)
    })
  }

  public async seekToEnd() {
    return this.commandQueue.push(async () => {
      return super.seekToEnd()
    })
  }

  public async resize(size: number) {
    return this.commandQueue.push(async () => {
      return super.resize(size)
    })
  }

  public async read(start: number, end: number): Promise<ArrayBuffer> {
    return this.commandQueue.push(async () => {
      return super.read(start, end)
    })
  }

  public async appendBufferByPosition(buffer: ArrayBuffer | Uint8Array, position: number) {
    return this.commandQueue.push(async () => {
      return super.appendBufferByPosition(buffer, position)
    })
  }

  public async close() {
    return this.commandQueue.push(async () => {
      return super.close()
    })
  }

  public async destroy() {
    await super.destroy()
    this.commandQueue.clear()
    this.commandQueue = null
  }

  get writeQueueSize() {
    return this.commandQueue?.length ?? 0
  }
}

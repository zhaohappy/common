import FileIO from './FileIO'
import CommandQueue from '../helper/CommandQueue'

/**
 * 安全的文件 IO 操作
 */
export default class SafeFileIO extends FileIO {

  private commandQueue: CommandQueue

  constructor(handler: FileSystemFileHandle, append: boolean = false) {
    super(handler, append)
    this.commandQueue = new CommandQueue()
  }

  public async write(data: BufferSource) {
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

  public async appendBufferByPosition(buffer: BufferSource, position: number) {
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

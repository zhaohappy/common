
const RESIZE_CHUNK_SIZE = 1024 * 1024 * 5

/**
 * 文件 IO
 */
export default class FileIO {

  private handler: FileSystemFileHandle

  private file: File

  private pos: number

  private writer: FileSystemWritableFileStream

  private append: boolean

  private reader: FileReader

  private size: number

  private blobSlice: (start?: number, end?: number, contentType?: string) => void

  private readied: boolean

  private readHold: {
    resolve: (data?: any) => void,
    reject: (data?: any) => void,
  }

  constructor(handler: FileSystemFileHandle, append: boolean = false) {
    this.handler = handler
    this.append = append
    this.readied = false
  }

  public async ready() {

    if (this.readied) {
      return
    }

    this.file = await this.handler.getFile()
    this.writer = await this.handler.createWritable()
    this.pos = this.append ? this.file.size : 0
    this.size = this.pos

    this.reader = new FileReader()

    this.blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice

    this.reader.onloadend = (event) => {
      if (this.readHold) {
        this.readHold.resolve(event.target.result)
        this.readHold = null
      }
    }

    this.readied = true
  }

  private async write_(data: BufferSource) {
    await this.writer.write(data)
    this.pos += data.byteLength
    if (this.pos > this.size) {
      this.size += data.byteLength
    }
  }

  public async write(data: BufferSource) {
    await this.write_(data)
  }

  private async seek_(position: number) {
    await this.writer.seek(position)
    this.pos = position
  }

  public async seek(position: number) {
    await this.seek_(position)
  }

  public async seekToEnd() {
    await this.seek_(this.size)
  }

  private async resize_(size: number) {
    if (size !== this.file.size) {
      if (size < this.file.size) {
        this.pos = this.file.size
      }
      await this.writer.truncate(size)
      this.size = size
    }
  }

  public async resize(size: number) {
    await this.resize_(size)
  }

  public async read_(start: number, end: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      this.readHold = {
        resolve,
        reject
      }
      this.reader.readAsArrayBuffer(this.blobSlice.call(this.file, start, end))
    })
  }

  public async read(start: number, end: number): Promise<ArrayBuffer> {
    return await this.read_(start, end)
  }

  public async appendBufferByPosition(buffer: BufferSource, position: number) {
    await this.writer.close()
    this.file = await this.handler.getFile()
    this.writer = await this.handler.createWritable({
      keepExistingData: true
    })

    const size = this.file.size
    const length = buffer.byteLength

    if (position >= this.file.size) {
      await this.resize_(position + length)
      await this.seek_(position)
      await this.write_(buffer)
    }
    else {
      let start = position
      await this.seek_(position)
      await this.write_(buffer)
      while (start < size) {
        const buffer = await this.read_(start, Math.min(start + RESIZE_CHUNK_SIZE, size))
        await this.write_(buffer)
        start += buffer.byteLength
      }
    }
  }

  private async close_() {

    if (!this.readied) {
      return
    }

    await this.writer.close()
    this.file = await this.handler.getFile()
    this.readied = false
  }

  public async close() {
    await this.close_()
  }

  public getFile() {
    return this.file
  }

  public getHandle() {
    return this.handler
  }

  public getPos() {
    return this.pos
  }

  public getSize() {
    return this.size
  }

  public async destroy() {
    await this.close_()
    this.handler = null
    this.file = null
  }
}

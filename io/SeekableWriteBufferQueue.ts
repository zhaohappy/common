import concatTypeArray from '../function/concatTypeArray'

export default class SeekableWriteBufferQueue {
  private queue: Uint8Array[]
  private pos: bigint

  private startPos: bigint
  private endPos: bigint

  private index: number
  private offset: number

  constructor() {
    this.queue = []

    this.startPos = 0n
    this.endPos = 0n
    this.pos = 0n
  }

  public push(buffer: Uint8Array) {
    if (this.pos === this.endPos) {
      this.queue.push(buffer)
      this.endPos += BigInt(buffer.length)
      this.pos += BigInt(buffer.length)
    }
    else {
      if (buffer.length < this.queue[this.index].length - this.offset) {
        this.queue[this.index].set(buffer, this.offset)
        this.offset += buffer.length
        this.pos += BigInt(buffer.length)

        if (this.offset === this.queue[this.index].length) {
          this.index++
          this.offset = 0
        }

        if (this.index === this.queue.length) {
          this.index = -1
          this.offset = -1
          this.pos = this.endPos
        }
      }
      else {
        let offset = 0
        while (offset < buffer.length) {
          const length = Math.min(this.queue[this.index].length - this.offset, buffer.length - offset)
          this.queue[this.index].set(buffer.subarray(offset, offset + length), this.offset)
          offset += length
          this.offset += length
          this.pos += BigInt(length)
          if (this.offset === this.queue[this.index].length) {
            if (this.index + 1 === this.queue.length) {
              if (offset < buffer.length) {
                const remain = buffer.subarray(buffer.length - offset)
                this.queue.push(remain)
                this.endPos += BigInt(remain.length)
              }
              this.pos = this.endPos
              this.index = -1
              this.offset = -1
              break
            }
            else {
              this.index++
              this.offset = 0
            }
          }
        }
      }
    }
  }

  public seek(pos: bigint) {
    if (pos < this.startPos || pos > this.endPos) {
      return false
    }
    this.pos = pos

    this.index = -1
    this.offset = -1

    let now = this.startPos
    for (let i = 0; i < this.queue.length; i++) {
      if (pos <= now + BigInt(this.queue[i].length)) {
        this.index = i
        this.offset = Number(pos - now)
        break
      }
      now += BigInt(this.queue[i].length)
    }

    if (this.index < 0) {
      this.pos = this.endPos
    }

    return true
  }

  public flush() {
    this.startPos = this.endPos
    this.pos = this.endPos
    this.index = -1
    this.offset = -1

    const buffer = concatTypeArray(Uint8Array, this.queue)
    this.queue.length = 0

    return buffer
  }

  get size() {
    return this.queue.length
  }
}

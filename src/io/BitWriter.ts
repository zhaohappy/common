/**
 * bit 写存器
 */

import { IOError } from './error'

/**
 * 写字节流工具
 */

export default class BitWriter {

  private buffer: Uint8Array

  private pointer: number

  private pos: bigint

  private bitPointer: number

  private size: number

  public error: number

  public onFlush: (data: Uint8Array, pos?: number) => number

  /**
   * @param data 待写的 Uint8Array
   */
  constructor(size: number = 1 * 1024 * 1024) {
    this.pointer = 0
    this.bitPointer = 0
    this.size = size
    this.error = 0
    this.pos = 0n

    this.buffer = new Uint8Array(this.size)
  }

  /**
   * 写一个 bit
   * 
   * @param bit 
   */
  public writeU1(bit: number) {
    if (this.remainingLength() < 1 || this.remainingLength() === 1 && this.bitPointer >= 8) {
      this.flush()
    }

    if (bit & 0x01) {
      this.buffer[this.pointer] |= (1 << (7 - this.bitPointer))
    }
    else {
      this.buffer[this.pointer] &= ~(1 << (7 - this.bitPointer))
    }


    this.bitPointer++

    if (this.bitPointer === 8) {
      this.pointer++
      this.pos++
      this.bitPointer = 0
    }
  }

  /**
   * 写 n 个比特
   * 
   * @param n
   */
  public writeU(n: number, v: number) {
    for (let i = 0; i < n; i++) {
      this.writeU1(v >> (n - i - 1 ) & 0x01)
    }
  }

  /**
   * 获取剩余可写节数
   * 
   * @returns 
   */
  public remainingLength() {
    return this.size - this.pointer
  }

  /**
   * 写出缓冲区
   */
  public flush() {

    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('BSWriter error, flush failed because of no flush callback')
    }

    if (this.pointer) {
      if (this.bitPointer && this.pointer > 0) {
        const ret = this.onFlush(this.buffer.subarray(0, this.pointer).slice())
        if (ret !== 0) {
          this.error = ret
          throw Error('BSWriter error, flush failed')
        }
        this.buffer[0] = this.buffer[this.pointer]
      }
      else if (this.bitPointer === 0) {
        const ret = this.onFlush(this.buffer.subarray(0, this.pointer))
        if (ret !== 0) {
          this.error = ret
          throw Error('BSWriter error, flush failed')
        }
      }
    }
    this.pointer = 0
  }

  /**
   * 对齐字节，当处在当前字节的第一个 bit 时不动，否则写入 0 直到下一个字节
   */
  public padding() {
    while (this.bitPointer !== 0) {
      this.writeU1(0)
    }
  }

  /**
   * 重置缓冲区
   */
  public reset() {
    this.pointer = 0
    this.bitPointer = 0
    this.error = 0
    this.pos = 0n
  }

  /**
   * 获取缓冲区
   * 
   * @returns 
   */
  public getBuffer() {
    return this.buffer
  }

  /**
   * 获取当前写指针位置
   * 
   * @returns 
   */
  public getPointer() {
    return this.pointer
  }

  /**
   * 获取当前的绝对位置
   * 
   * @returns 
   */
  public getPos() {
    return this.pos
  }
}

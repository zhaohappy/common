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

  public flush() {

    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('BSWriter error, flush failed because of no flush callback')
    }

    if (this.pointer) {
      if (this.bitPointer && this.pointer > 1) {
        const ret = this.onFlush(this.buffer.subarray(0, this.pointer - 1))
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

  public padding() {
    while (this.bitPointer !== 0) {
      this.writeU1(0)
    }
  }

  public clear() {
    this.pointer = 0
    this.bitPointer = 0
    this.error = 0
  }

  public getBuffer() {
    return this.buffer
  }

  public getPointer() {
    return this.pointer
  }
}

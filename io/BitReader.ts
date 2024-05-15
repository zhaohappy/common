/**
 * bit 读取器
 */

import { IOError } from './error'
import * as logger from '../util/logger'
import { Uint8ArrayInterface } from './interface'

export default class BitReader {

  private buffer: Uint8Array

  private pointer: number

  private bitsLeft: number

  private size: number

  private endPointer: number

  public error: number

  public onFlush: (data: Uint8Array) => number

  /**
   * @param data 待读取的字节
   * @param bigEndian 是否按大端字节序读取，默认大端字节序（网络字节序）
   */
  constructor(size: number = 1 * 1024 * 1024) {
    this.pointer = 0
    this.bitsLeft = 8

    this.size = size
    this.endPointer = 0
    this.error = 0

    this.buffer = new Uint8Array(this.size)
  }

  /**
   * 不影响原读取操作的情况下，读取 1 个比特
   */
  public peekU1() {
    let result = 0
    if (this.remainingLength() < 1 || this.remainingLength() === 1 && this.bitsLeft === 0) {
      this.flush()
    }

    let pointer = this.pointer
    let bitsLeft = this.bitsLeft

    if (bitsLeft === 0) {
      pointer++
      bitsLeft = 8
    }

    result = (this.buffer[pointer] >> (bitsLeft - 1)) & 0x01
    return result
  }

  /**
   * 读取 1 个比特
   */
  public readU1() {
    let result = 0

    if (this.remainingLength() < 1 || this.remainingLength() === 1 && this.bitsLeft === 0) {
      this.flush()
    }

    this.bitsLeft--

    result = (this.buffer[this.pointer] >> this.bitsLeft) & 0x01

    if (this.bitsLeft === 0) {
      this.pointer++
      this.bitsLeft = 8
    }

    return result
  }

  /**
   * 读取 n 个比特
   * 
   * @param n
   */
  public readU(n: number) {
    let result = 0
    for (let i = 0; i < n; i++) {
      result |= (this.readU1() << (n - i - 1))
    }
    return result
  }

  /**
   * 获取剩余可读字节数
   * 
   * @returns 
   */
  public remainingLength() {
    return this.endPointer - this.pointer
  }

  public getPos() {
    return this.pointer
  }

  public flush() {

    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOReader error, flush failed because of no flush callback')
    }

    if (this.bitsLeft === 0) {
      this.pointer++
    }

    if (this.size - this.remainingLength() <= 0) {
      return
    }

    if (this.pointer < this.endPointer) {
      this.buffer.set(this.buffer.subarray(this.pointer, this.endPointer), 0)

      const len = this.onFlush(this.buffer.subarray(this.endPointer - this.pointer, this.size))

      if (len < 0) {
        this.error = len
        throw Error('IOReader error, flush failed')
      }

      this.endPointer = this.endPointer - this.pointer + len
      this.pointer = 0
    }
    else {
      const len = this.onFlush(this.buffer)

      this.endPointer = len
      this.pointer = 0
      this.bitsLeft = 8

      if (len < 0) {
        this.error = len
        throw Error('IOReader error, flush failed')
      }
    }
  }

  public getBuffer() {
    return this.buffer
  }

  public appendBuffer(buffer: Uint8ArrayInterface) {
    if (this.size - this.endPointer >= buffer.length) {
      this.buffer.set(buffer, this.endPointer)
      this.endPointer += buffer.length
    }
    else {
      this.buffer.set(this.buffer.subarray(this.pointer, this.endPointer), 0)
      this.endPointer = this.endPointer - this.pointer
      this.pointer = 0

      if (this.size - this.endPointer >= buffer.length) {
        this.buffer.set(buffer, this.endPointer)
        this.endPointer += buffer.length
      }
      else {
        const len = Math.min(this.size - this.endPointer, buffer.length)
        this.buffer.set(buffer.subarray(0, len), this.endPointer)
        this.endPointer += len

        logger.warn('BSReader, call appendBuffer but the buffer\'s size is lagger then the remaining size')
      }
    }
  }

  public clear() {
    this.pointer = this.endPointer = 0
    this.bitsLeft = 8
    this.error = 0
  }

  public skipPadding() {
    if (this.bitsLeft < 8) {
      this.bitsLeft = 8
      this.pointer++
    }
  }
}

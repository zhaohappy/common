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

  private pos: bigint

  public error: number

  public onFlush: (data: Uint8Array) => number

  /**
   * @param data 待读取的字节
   * @param bigEndian 是否按大端字节序读取，默认大端字节序（网络字节序）
   */
  constructor(size: number = 1 * 1024 * 1024) {
    this.pointer = 0
    this.bitsLeft = 8
    this.pos = 0n

    this.size = size
    this.endPointer = 0
    this.error = 0

    this.buffer = new Uint8Array(this.size)
  }

  /**
   * 读取 1 个比特（不会移动读取指针）
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
      this.pos++
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

  /**
   * 当前字节剩余的 bit 数
   * 
   * @returns 
   */
  public getBitLeft() {
    return this.bitsLeft
  }

  /**
   * 获取当前读取指针位置
   * 
   * @returns 
   */
  public getPointer() {
    return this.pointer
  }

  /**
   * 设置读取指针到指定位置
   * 
   * @param pointer 
   */
  public setPointer(pointer: number) {
    this.pointer = pointer
  }

  /**
   * 返回当前的绝对位置
   * 
   * @returns 
   */
  public getPos() {
    return this.pos
  }

  /**
   * 跳过指定 bit 数
   * 
   * @param n 
   */
  public skip(n: number) {
    const byte = (n - (n % 8)) / 8

    this.pointer += byte
    this.pos += BigInt(byte)

    const bitsLeft = n % 8

    if (this.bitsLeft <= bitsLeft) {
      this.pointer++
      this.pos++
      this.bitsLeft = 8 - (bitsLeft - this.bitsLeft)
    }
    else {
      this.bitsLeft -= bitsLeft
    }
  }

  /**
   * 填充剩余缓冲区
   */
  public flush() {

    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOReader error, flush failed because of no flush callback')
    }

    if (this.bitsLeft === 0) {
      this.pointer++
      this.pos++
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

  /**
   * 获取缓冲区
   * 
   * @returns 
   */
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

  /**
   * 重置缓冲区
   */
  public reset() {
    this.pointer = this.endPointer = 0
    this.bitsLeft = 8
    this.error = 0
    this.pos = 0n
  }

  /**
   * 对齐字节，当处在当前字节的第一个 bit 时不动，否则移动到下一个字节
   */
  public skipPadding() {
    if (this.bitsLeft < 8) {
      this.bitsLeft = 8
      this.pointer++
      this.pos++
    }
  }
}

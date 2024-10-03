/**
 * 写字节流工具
 */

import { IOError } from './error'
import * as text from '../util/text'
import { Uint8ArrayInterface, BytesWriterSync } from './interface'

export default class IOWriterSync implements BytesWriterSync {

  private data: DataView

  private buffer: Uint8ArrayInterface

  private pointer: number

  private pos: bigint

  private size: number

  private littleEndian: boolean

  public error: number

  public onFlush: (data: Uint8Array, pos?: bigint) => number
  public onSeek: (seek: bigint) => number

  /**
   * @param data 待写的 Uint8Array
   * @param bigEndian 是否按大端字节序写，默认大端字节序（网络字节序）
   */
  constructor(size: number = 1 * 1024 * 1024, bigEndian: boolean = true, map?: Uint8ArrayInterface) {
    this.pointer = 0
    this.pos = 0n
    this.size = size
    this.littleEndian = !bigEndian
    this.error = 0

    if (map && map.view) {
      this.size = map.length
      this.buffer = map
      this.data = map.view
    }
    else if (map && !map.byteOffset) {
      this.size = map.length
      this.buffer = map
      this.data = new DataView(this.buffer.buffer)
    }
    else {

      if (map) {
        throw new Error('not support subarray of ArrayBuffer')
      }

      this.buffer = new Uint8Array(this.size)
      this.data = new DataView(this.buffer.buffer)
    }
  }

  /**
   * 写 8 位无符号整数
   */
  public writeUint8(value: number) {
    if (this.remainingLength() < 1) {
      this.flush()
    }
    this.data.setUint8(this.pointer, value)
    this.pointer++
    this.pos++
  }

  /**
   * 读取 16 位无符号整数
   */
  public writeUint16(value: number) {
    if (this.remainingLength() < 2) {
      this.flush()
    }
    this.data.setUint16(this.pointer, value, this.littleEndian)
    this.pointer += 2
    this.pos += 2n
  }

  /**
   * 写 24 位无符号整数
   */
  public writeUint24(value: number) {
    if (this.remainingLength() < 3) {
      this.flush()
    }
    const high = (value & 0xff0000) >> 16
    const middle = (value & 0x00ff00) >> 8
    const low = value & 0x0000ff
    if (this.littleEndian) {
      this.writeUint8(low)
      this.writeUint8(middle)
      this.writeUint8(high)
    }
    else {
      this.writeUint8(high)
      this.writeUint8(middle)
      this.writeUint8(low)
    }
  }

  /**
   * 写 32 位无符号整数
   */
  public writeUint32(value: number) {
    if (this.remainingLength() < 4) {
      this.flush()
    }
    this.data.setUint32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写 64 位无符号整数
   */
  public writeUint64(value: bigint) {
    if (this.remainingLength() < 8) {
      this.flush()
    }
    this.data.setBigUint64(this.pointer, value, this.littleEndian)
    this.pointer += 8
    this.pos += 8n
  }

  /**
   * 写 8 位有符号整数
   * 
   * @returns 
   */
  public writeInt8(value: number) {
    if (this.remainingLength() < 1) {
      this.flush()
    }
    this.data.setInt8(this.pointer, value)
    this.pointer++
    this.pos++
  }

  /**
   * 写 16 位有符号整数
   */
  public writeInt16(value: number) {
    if (this.remainingLength() < 2) {
      this.flush()
    }
    this.data.setInt16(this.pointer, value, this.littleEndian)
    this.pointer += 2
    this.pos += 2n
  }

  /**
   * 写 24 位有符号整数
   */
  public writeInt24(value: number) {
    this.writeUint24(value < 0 ? (value + 0x1000000) : value)
  }

  /**
   * 写 32 位有符号整数
   */
  public writeInt32(value: number) {
    if (this.remainingLength() < 4) {
      this.flush()
    }
    this.data.setInt32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写 64 位有符号整数
   */
  public writeInt64(value: bigint) {
    if (this.remainingLength() < 8) {
      this.flush()
    }
    this.data.setBigInt64(this.pointer, value, this.littleEndian)
    this.pointer += 8
    this.pos += 8n
  }

  /**
   * 写单精度浮点数
   * 
   * @returns 
   */
  public writeFloat(value: number) {
    if (this.remainingLength() < 4) {
      this.flush()
    }
    this.data.setFloat32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写双精度浮点数
   */
  public writeDouble(value: number) {
    if (this.remainingLength() < 8) {
      this.flush()
    }
    this.data.setFloat64(this.pointer, value, this.littleEndian)
    this.pointer += 8
    this.pos += 8n
  }

  /**
   * 获取当前写指针
   * 
   * @returns 
   */
  public getPointer() {
    return this.pointer
  }

  public getPos() {
    return this.pos
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
   * 写指定长度的二进制 buffer 数据
   * 
   * @param length 
   * @returns 
   */
  public writeBuffer(buffer: Uint8ArrayInterface) {

    if (!buffer.length) {
      return
    }

    let length = buffer.length
    if (this.remainingLength() < length) {
      let index = 0
      while (length > 0) {
        this.flush()
        const len = Math.min(this.size, length)
        this.buffer.set(buffer.subarray(index, index + len), this.pointer)

        this.pointer += len
        this.pos += BigInt(len)
        index += len
        length -= len
      }
    }
    else {
      this.buffer.set(buffer, this.pointer)
      this.pointer += length
      this.pos += BigInt(length)
    }
  }

  /**
   * 写一个字符串
   */
  public writeString(str: string) {
    const buffer = text.encode(str)
    this.writeBuffer(buffer)
    return buffer.length
  }

  /**
   * 将缓冲区中数据写出
   */
  public flush() {
    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, flush failed because of no flush callback')
    }

    if (this.pointer) {
      const ret = this.onFlush(this.buffer.subarray(0, this.pointer))
      if (ret !== 0) {
        this.error = ret
        throw Error('IOWriter error, flush failed')
      }
    }
    this.pointer = 0
  }

  /**
   * 将缓冲区中数据写出到指定位置
   * 
   * @param pos 
   */
  public flushToPos(pos: bigint) {
    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, flush failed because of no flush callback')
    }
    if (this.pointer) {
      const ret = this.onFlush(this.buffer.subarray(0, this.pointer), pos)
      if (ret !== 0) {
        this.error = ret
        throw Error('IOWriter error, flush failed')
      }
    }
    this.pointer = 0
  }

  /**
   * seek 到指定位置
   * 
   * @param pos 
   */
  public seek(pos: bigint) {
    if (!this.onSeek) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, seek failed because of no seek callback')
    }

    this.flush()

    const ret = this.onSeek(pos)

    if (ret !== 0) {
      this.error = ret
      throw Error('IOWriter error, seek failed')
    }

    this.pos = pos
  }

  /**
   * 在当前缓冲区映射区间内 seek
   * 
   * @param pos 
   */
  public seekInline(pos: number) {
    const pointer = this.pointer
    this.pointer = Math.max(0, Math.min(this.size, pos))
    this.pos += BigInt(this.pointer - pointer)
  }

  /**
   * 跳过指定长度
   * 
   * @param length 
   */
  public skip(length: number) {
    const pointer = this.pointer
    this.pointer = Math.min(this.size, this.pointer + length)
    this.pos += BigInt(this.pointer - pointer)
  }

  /**
   * 回退指定长度，不能大于 pointer 大小
   * 
   * @param length 
   */
  public back(length: number) {
    const pointer = this.pointer
    this.pointer = Math.max(0, this.pointer - length)
    this.pos += BigInt(this.pointer - pointer)
  }

  /**
   * 获取缓冲区
   * 
   * @returns 
   */
  public getBuffer() {
    return this.buffer.subarray(0, this.pointer)
  }

  /**
   * 设置读取是小端还是大端
   * 
   * @param bigEndian 
   */
  public setEndian(bigEndian: boolean) {
    this.littleEndian = !bigEndian
  }

  /**
   * 重置 writer
   */
  public reset() {
    this.pointer = 0
    this.pos = 0n
    this.error = 0
  }

  /**
   * 获取缓冲区长度
   * 
   * @returns 
   */
  public getBufferSize() {
    return this.size
  }
}

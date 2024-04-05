/**
 * 写字节流工具
 */

import * as logger from '../util/logger'
import { Uint8ArrayInterface, BytesWriterSync } from './interface'
import * as text from '../util/text'

export default class StreamWriter implements BytesWriterSync {

  private data: DataView

  private buffer: Uint8ArrayInterface

  private byteStart: number

  private pos: number

  private size: number

  private littleEndian: boolean

  /**
   * @param data 待写的 Uint8Array
   * @param bigEndian 是否按大端字节序写，默认大端字节序（网络字节序）
   */
  constructor(data: Uint8ArrayInterface, bigEndian: boolean = true) {
    this.buffer = data
    this.data = data instanceof Uint8Array ? new DataView(data.buffer) : data.view
    this.byteStart = data instanceof Uint8Array ? data.byteOffset : 0
    this.pos = 0
    this.size = data.byteLength
    this.littleEndian = !bigEndian
  }

  /**
   * 写 8 位无符号整数
   */
  public writeUint8(value: number) {
    this.data.setUint8(this.pos++ + this.byteStart, value)
  }

  /**
   * 读取 16 位无符号整数
   */
  public writeUint16(value: number) {
    this.data.setUint16(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 2
  }

  /**
   * 写 24 位无符号整数
   */
  public writeUint24(value: number) {
    const high = value & 0xf00
    const middle = value & 0x0f0
    const low = value & 0x00f
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
    this.data.setUint32(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 4
  }

  /**
   * 写 64 位无符号整数
   */
  public writeUint64(value: bigint) {
    const low = value & 0xffffffffn
    const high = (value & (0xffffffffn << 32n)) >> 32n
    if (this.littleEndian) {
      this.writeUint32(Number(low))
      this.writeUint32(Number(high))
    }
    else {
      this.writeUint32(Number(high))
      this.writeUint32(Number(low))
    }
  }

  /**
   * 写 8 位有符号整数
   * 
   * @returns 
   */
  public writeInt8(value: number) {
    this.data.setInt8(this.pos++ + this.byteStart, value)
  }

  /**
   * 写 16 位有符号整数
   */
  public writeInt16(value: number) {
    this.data.setInt16(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 2
  }

  /**
   * 写 32 位有符号整数
   */
  public writeInt32(value: number) {
    this.data.setInt32(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 4
  }

  /**
   * 写 64 位有符号整数
   */
  public writeInt64(value: bigint) {
    const low = value & BigInt(0xffffffff)
    const high = (value & (BigInt(0xffffffff) << 32n)) >> 32n
    if (this.littleEndian) {
      this.writeInt32(Number(low))
      this.writeInt32(Number(high))
    }
    else {
      this.writeInt32(Number(high))
      this.writeInt32(Number(low))
    }
  }

  /**
   * 写单精度浮点数
   * 
   * @returns 
   */
  public writeFloat(value: number) {
    this.data.setFloat32(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 4
  }

  /**
   * 写双精度浮点数
   */
  public writeDouble(value: number) {
    this.data.setFloat64(this.pos + this.byteStart, value, this.littleEndian)
    this.pos += 8
  }

  /**
   * 获取当前写指针
   * 
   * @returns 
   */
  public getPos() {
    return this.pos
  }

  /**
   * seek 写指针
   * 
   * @param pos 
   */
  public seek(pos: number) {
    if (pos > this.size) {
      pos = this.size
    }
    this.pos = Math.max(0, pos)
  }

  /**
   * 跳过指定字节长度
   * 
   * @param length 
   */
  public skip(length: number) {
    this.seek(this.pos + length)
  }

  /**
   * 返回指定字节长度
   * 
   * @param length 
   */
  public back(length: number) {
    this.seek(this.pos - length)
  }

  /**
   * 获取剩余可写节数
   * 
   * @returns 
   */
  public remainingSize() {
    return this.size - this.pos
  }

  /**
   * 写指定长度的二进制 buffer 数据
   * 
   * @param length 
   * @returns 
   */
  public writeBuffer(buffer: Uint8ArrayInterface) {
    let length = buffer.length
    if (this.remainingSize() < length) {
      length = this.remainingSize()
      logger.warn(`the remaining buffer size is smaller then the wrote buffer, hope set ${buffer.length}, but set ${length}`)
    }
    this.buffer.set(buffer, this.pos)
    this.pos += buffer.length
  }

  /**
   * 写一个字符串
   */
  public writeString(str: string) {
    const buffer = text.encode(str)
    this.writeBuffer(buffer)
    return buffer.length
  }

  public getWroteBuffer() {
    return this.buffer.subarray(0, this.pos)
  }

  public resetBuffer(data: Uint8ArrayInterface, bigEndian: boolean = true) {
    this.buffer = data
    this.data = data instanceof Uint8Array ? new DataView(data.buffer) : data.view
    this.byteStart = data instanceof Uint8Array ? data.byteOffset : 0

    this.pos = 0
    this.size = data.byteLength
    this.littleEndian = !bigEndian
  }
}

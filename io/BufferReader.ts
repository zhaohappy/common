/**
 * 读字节流工具
 */

import concatTypeArray from '../function/concatTypeArray'
import * as text from '../util/text'
import { Uint8ArrayInterface, BytesReaderSync } from './interface'

export default class BufferReader implements BytesReaderSync {

  private data: DataView

  private buffer: Uint8ArrayInterface

  private byteStart: number

  private pos: number

  private size: number

  private littleEndian: boolean

  /**
   * @param data 待读取的字节
   * @param bigEndian 是否按大端字节序读取，默认大端字节序（网络字节序）
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
   * 读取 8 位无符号整数
   * 
   * @returns 
   */
  public readUint8() {
    return this.data.getUint8(this.pos++ + this.byteStart)
  }
  public peekUint8() {
    return this.data.getUint8(this.pos + this.byteStart)
  }

  /**
   * 读取 16 位无符号整数
   * 
   * @returns 
   */
  public readUint16() {
    const value = this.data.getUint16(this.pos + this.byteStart, this.littleEndian)
    this.pos += 2
    return value
  }
  public peekUint16() {
    const value = this.data.getUint16(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取 24 位无符号整数
   * 
   * @returns 
   */
  public readUint24() {
    const high = this.readUint16()
    const low = this.readUint8()
    return this.littleEndian ? (low << 16 | high) : (high << 8 | low)
  }
  public peekUint24() {
    const high = this.readUint16()
    const low = this.readUint8()
    this.pos -= 3
    return this.littleEndian ? (low << 16 | high) : (high << 8 | low)
  }

  /**
   * 读取 32 位无符号整数
   * 
   * @returns 
   */
  public readUint32() {
    const value = this.data.getUint32(this.pos + this.byteStart, this.littleEndian)
    this.pos += 4
    return value
  }
  public peekUint32() {
    const value = this.data.getUint32(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取 64 位无符号整数
   * 
   * @returns 
   */
  public readUint64() {
    const high = BigInt(this.readUint32())
    const low = BigInt(this.readUint32())
    if (this.littleEndian) {
      return low << 32n | high
    }
    else {
      return high << 32n | low
    }
  }
  public peekUint64() {
    const high = BigInt(this.readUint32())
    const low = BigInt(this.readUint32())
    this.pos -= 8
    if (this.littleEndian) {
      return low << 32n | high
    }
    else {
      return high << 32n | low
    }
  }

  /**
   * 读取 8 位有符号整数
   * 
   * @returns 
   */
  public readInt8() {
    return this.data.getInt8(this.pos++ + this.byteStart)
  }
  public peekInt8() {
    return this.data.getInt8(this.pos + this.byteStart)
  }

  /**
   * 读取 16 位有符号整数
   * 
   * @returns 
   */
  public readInt16() {
    const value = this.data.getInt16(this.pos + this.byteStart, this.littleEndian)
    this.pos += 2
    return value
  }
  public peekInt16() {
    const value = this.data.getInt16(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取 24 位有符号整数
   * 
   * @returns 
   */
  public readInt24() {
    const value = this.readUint24()
    return (value & 0x800000) ? (value - 0x1000000) : value
  }
  public peekInt24() {
    const value = this.peekUint24()
    return (value & 0x800000) ? (value - 0x1000000) : value
  }

  /**
   * 读取 32 位有符号整数
   * 
   * @returns 
   */
  public readInt32() {
    const value = this.data.getInt32(this.pos + this.byteStart, this.littleEndian)
    this.pos += 4
    return value
  }
  public peekInt32() {
    const value = this.data.getInt32(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取 64 位有符号整数
   * 
   * @returns 
   */
  public readInt64() {
    const high = BigInt(this.readInt32())
    const low = BigInt(this.readInt32())
    if (this.littleEndian) {
      return low << 32n | high
    }
    else {
      return high << 32n | low
    }
  }
  public peekInt64() {
    const high = BigInt(this.readInt32())
    const low = BigInt(this.readInt32())
    this.pos -= 8
    if (this.littleEndian) {
      return low << 32n | high
    }
    else {
      return high << 32n | low
    }
  }

  /**
   * 读取单精度浮点数
   * 
   * @returns 
   */
  public readFloat() {
    const value = this.data.getFloat32(this.pos + this.byteStart, this.littleEndian)
    this.pos += 4
    return value
  }
  public peekFloat() {
    const value = this.data.getFloat32(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取双精度浮点数
   * 
   * @returns 
   */
  public readDouble() {
    const value = this.data.getFloat64(this.pos + this.byteStart, this.littleEndian)
    this.pos += 8
    return value
  }
  public peekDouble() {
    const value = this.data.getFloat64(this.pos + this.byteStart, this.littleEndian)
    return value
  }

  /**
   * 读取指定长度的字节，并以 16 进制字符串返回
   * 
   * @param length 默认 1
   * @returns 
   */
  public readHex(length: number = 1) {
    let hexStr = ''
    for (let i = 0; i < length; i++) {
      const hex = this.readUint8().toString(16)
      hexStr += (hex.length === 1 ? '0' + hex : hex)
    }
    return hexStr
  }
  public peekHex(length: number = 1) {
    const pos = this.pos
    const str = this.readHex(length)
    this.pos = pos
    return str
  }

  /**
   * 读取指定长度的字符串
   * 
   * @param length 默认 1
   * @returns 
   */
  public readString(length: number = 1) {
    let str: string = ''
    if (length) {
      let start = this.pos
      for (let i = 0; i < length; i++) {
        if (this.buffer[this.pos + i] === 0) {
          start++
        }
        else {
          break
        }
      }
      str = text.decode(this.buffer.subarray(start, start + length))
    }
    this.pos += length

    return str
  }
  public peekString(length: number = 1) {
    const pos = this.pos
    const str = this.readString(length)
    this.pos = pos
    return str
  }

  /**
   * 读取一行字符
   */
  public readLine() {
    let str = ''

    for (let i = this.pos; i < this.size; i++) {
      if (this.buffer[i] === 0x0a || this.buffer[i] === 0x0d) {
        str += this.readString(i - this.pos)
        break
      }
    }


    for (let i = this.pos; i < this.size; i++) {
      if (this.buffer[i] === 0x0a || this.buffer[i] === 0x0d) {
        this.readUint8()
      }
      else {
        break
      }
    }

    return str
  }
  public peekLine() {
    const pos = this.pos
    const str = this.readLine()
    this.pos = pos
    return str
  }

  /**
   * 获取当前读取指针
   * 
   * @returns 
   */
  public getPos() {
    return BigInt(this.pos)
  }

  /**
   * seek 读取指针
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
   * 获取剩余可读字节数
   * 
   * @returns 
   */
  public remainingSize() {
    return this.size - this.pos
  }

  /**
   * 读取指定长度的二进制 buffer 数据
   * 
   * @param length 
   * @returns 
   */
  public readBuffer(length: number) {
    length = Math.min(length, this.remainingSize())
    const buffer = this.buffer.slice(this.pos, this.pos + length)
    this.pos += length
    return buffer
  }

  /**
   * 追加 buffer
   * 
   * @param buffer 
   */
  public appendBuffer(buffer: Uint8ArrayInterface) {
    this.buffer = concatTypeArray(Uint8Array, [
      this.buffer.slice(),
      buffer.slice()
    ])
    this.data = new DataView(this.buffer.buffer)
    this.size += buffer.byteLength
    this.byteStart = 0
  }

  /**
   * 重新装载数据
   * 
   * @param data 
   * @param bigEndian 
   */
  public resetBuffer(data: Uint8ArrayInterface, bigEndian: boolean = true) {
    this.buffer = data
    this.data = data instanceof Uint8Array ? new DataView(data.buffer) : data.view
    this.byteStart = data instanceof Uint8Array ? data.byteOffset : 0

    this.pos = 0
    this.size = data.byteLength
    this.littleEndian = !bigEndian
  }
}

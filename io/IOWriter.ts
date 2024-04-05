/**
 * 写字节流工具
 */

import { IOError } from './error'
import * as text from '../util/text'
import { Uint8ArrayInterface, BytesWriter } from './interface'

export default class IOWriter implements BytesWriter {

  private data: DataView

  private buffer: Uint8ArrayInterface

  private pointer: number

  private pos: bigint

  private size: number

  private littleEndian: boolean

  public error: number

  public onFlush: (data: Uint8Array, pos?: bigint) => Promise<number>
  public onSeek: (seek: bigint) =>  Promise<number>

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

    if (map) {
      this.buffer = map
      this.data = map.view
    }
    else {
      this.buffer = new Uint8Array(this.size)
      this.data = new DataView(this.buffer.buffer)
    }
  }

  /**
   * 写 8 位无符号整数
   */
  public async writeUint8(value: number) {
    if (this.remainingLength() < 1) {
      await this.flush()
    }
    this.data.setUint8(this.pointer, value)
    this.pointer++
    this.pos++
  }

  /**
   * 读取 16 位无符号整数
   */
  public async writeUint16(value: number) {
    if (this.remainingLength() < 2) {
      await this.flush()
    }
    this.data.setUint16(this.pointer, value, this.littleEndian)
    this.pointer += 2
    this.pos += 2n
  }

  /**
   * 写 24 位无符号整数
   */
  public async writeUint24(value: number) {
    if (this.remainingLength() < 3) {
      await this.flush()
    }
    const high = (value & 0xff0000) >> 16
    const middle = (value & 0x00ff00) >> 8
    const low = value & 0x0000ff
    if (this.littleEndian) {
      await this.writeUint8(low)
      await this.writeUint8(middle)
      await this.writeUint8(high)
    }
    else {
      await this.writeUint8(high)
      await this.writeUint8(middle)
      await this.writeUint8(low)
    }
  }

  /**
   * 写 32 位无符号整数
   */
  public async writeUint32(value: number) {
    if (this.remainingLength() < 4) {
      await this.flush()
    }
    this.data.setUint32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写 64 位无符号整数
   */
  public async writeUint64(value: bigint) {
    if (this.remainingLength() < 8) {
      await this.flush()
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
  public async writeInt8(value: number) {
    if (this.remainingLength() < 1) {
      await this.flush()
    }
    this.data.setInt8(this.pointer, value)
    this.pointer++
    this.pos++
  }

  /**
   * 写 16 位有符号整数
   */
  public async writeInt16(value: number) {
    if (this.remainingLength() < 2) {
      await this.flush()
    }
    this.data.setInt16(this.pointer, value, this.littleEndian)
    this.pointer += 2
    this.pos += 2n
  }

  /**
   * 写 32 位有符号整数
   */
  public async writeInt32(value: number) {
    if (this.remainingLength() < 4) {
      await this.flush()
    }
    this.data.setInt32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写 64 位有符号整数
   */
  public async writeInt64(value: bigint) {
    if (this.remainingLength() < 8) {
      await this.flush()
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
  public async writeFloat(value: number) {
    if (this.remainingLength() < 4) {
      await this.flush()
    }
    this.data.setFloat32(this.pointer, value, this.littleEndian)
    this.pointer += 4
    this.pos += 4n
  }

  /**
   * 写双精度浮点数
   */
  public async writeDouble(value: number) {
    if (this.remainingLength() < 8) {
      await this.flush()
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
  public async writeBuffer(buffer: Uint8ArrayInterface) {

    if (!buffer.length) {
      return
    }

    let length = buffer.length
    if (this.remainingLength() < length) {
      let index = 0
      while (length > 0) {
        await this.flush()
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
  public async writeString(str: string) {
    const buffer = text.encode(str)
    await this.writeBuffer(buffer)
    return buffer.length
  }

  public encodeString(str: string) {
    return text.encode(str)
  }

  public async flush() {
    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, flush failed because of no flush callback')
    }

    if (this.pointer) {
      const ret = await this.onFlush(this.buffer.subarray(0, this.pointer))
      if (ret !== 0) {
        this.error = ret
        throw Error('IOWriter error, flush failed')
      }
    }
    this.pointer = 0
  }

  public async flushToPos(pos: bigint) {
    if (!this.onFlush) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, flush failed because of no flush callback')
    }
    if (this.pointer) {
      const ret = await this.onFlush(this.buffer.subarray(0, this.pointer), pos)
      if (ret !== 0) {
        this.error = ret
        throw Error('IOWriter error, flush failed')
      }
    }
    this.pointer = 0
  }

  public async seek(pos: bigint) {
    if (!this.onSeek) {
      this.error = IOError.INVALID_OPERATION
      throw Error('IOWriter error, seek failed because of no seek callback')
    }

    await this.flush()

    const ret = await this.onSeek(pos)

    if (ret !== 0) {
      this.error = ret
      throw Error('IOWriter error, seek failed')
    }

    this.pos = pos
  }

  public seekInline(pos: number) {
    const pointer = this.pointer
    this.pointer = Math.max(0, Math.min(this.size, pos))
    this.pos += BigInt(this.pointer - pointer)
  }

  public skip(length: number) {
    const pointer = this.pointer
    this.pointer = Math.min(this.size, this.pointer + length)
    this.pos += BigInt(this.pointer - pointer)
  }

  public back(length: number) {
    const pointer = this.pointer
    this.pointer = Math.max(0, this.pointer - length)
    this.pos += BigInt(this.pointer - pointer)
  }

  public getBuffer() {
    return this.buffer.subarray(0, this.pointer)
  }

  public setEndian(bigEndian: boolean) {
    this.littleEndian = !bigEndian
  }

  public reset() {
    this.pointer = 0
    this.pos = 0n
    this.error = 0
  }

  public getBufferSize() {
    return this.size
  }
}

import { TypeArrayConstructor, TypeArray } from '../types/type'

/**
 * 环形缓冲区
 */
export default class RingBuffer<T extends TypeArray> {

  private size: number

  private length: number

  private valid: number

  private tail: number

  private data: TypeArray

  private pos: number

  private constructorFunction: TypeArrayConstructor

  constructor(size: number, constructor: TypeArrayConstructor) {
    this.data = new constructor(size)
    this.valid = 0
    this.tail = 0
    this.length = 0
    this.pos = 0
    this.size = size
    this.constructorFunction = constructor
  }

  /**
   * 写入数据到缓冲区
   * 
   * @param data 
   * @returns 
   */
  public write(data: T) {
    const length = data.length
    if (length > this.size) {
      return
    }
    if (this.tail + length > this.size) {
      const len1 = this.size - this.tail
      const len2 = length - len1
      this.data.set(data.subarray(0, len1), this.tail)
      this.data.set(data.subarray(len1), 0)

      this.tail = len2
    }
    else {
      this.data.set(data, this.tail)
      this.tail += length
    }

    if (this.length + length > this.size) {
      const moveLen = this.length + length - this.size
      if (this.valid + moveLen > this.size) {
        const len1 = this.size - this.valid
        const len2 = moveLen - len1
        this.valid = len2
      }
      else {
        this.valid += moveLen
      }
      this.length = this.size
    }
    else {
      this.length += length
    }
  }

  /**
   * 从缓冲区读取指定长度的数据
   * 
   * @param length 
   * @returns 
   */
  public read(length: number): T {
    if (this.length === 0) {
      return
    }
    if (length > this.length) {
      length = this.length
    }

    const data = new this.constructorFunction(length)

    if (this.valid + length > this.size) {
      const len1 = this.size - this.valid
      const len2 = length - len1
      data.set(this.data.subarray(this.valid, this.valid + len1), 0)
      data.set(this.data.subarray(0, len2), len1)
      this.valid = len2
    }
    else {
      data.set(this.data.subarray(this.valid, this.valid + length), 0)
      this.valid += length
    }

    this.length -= length

    this.pos += length

    return data as T
  }

  /**
   * 读取指定区间的数据
   * 
   * @param start 
   * @param end 
   * @returns 
   */
  public readByRange(start: number, end: number) {
    if (start <= end) {
      const data = new this.constructorFunction(end - start)
      data.set(this.data.subarray(start, end), 0)
      return data as T
    }
    else {
      const data = new this.constructorFunction(this.size - start + end)
      data.set(this.data.subarray(start), 0)
      data.set(this.data.subarray(0, end), this.size - start)

      return data as T
    }
  }

  /**
   * 获取当前读取指针
   * 
   * @returns 
   */
  public getCurrentPointer() {
    return this.valid
  }

  /**
   * 读取一个字节
   * 
   * @returns 
   */
  public readByte() {
    if (this.length > 0) {
      let result: number
      if (this.valid >= this.size) {
        this.valid = 1
        result = this.data[0]
      }
      else {
        result = this.data[this.valid++]
      }

      this.length -= 1
      this.pos += 1

      return result
    }
  }

  /**
   * 读取指定位置的数据
   * 
   * @param index 
   * @returns 
   */
  public getByteByIndex(index: number) {
    if (this.length > index) {
      let result: number
      if (this.valid + index >= this.size) {
        const len1 = this.size - this.valid
        const pointer = index - len1
        result = this.data[pointer]
      }
      else {
        result = this.data[this.valid + index]
      }
      return result
    }
  }

  /**
   * 获取缓冲区大小
   * 
   * @returns 
   */
  public getSize() {
    return this.size
  }

  /**
   * 获取数据大小
   * 
   * @returns 
   */
  public getLength() {
    return this.length
  }

  /**
   * 获取当前读取位置
   * 
   * @returns 
   */
  public getPos() {
    return this.pos
  }

  /**
   * 获取缓冲区剩余长度
   * 
   * @returns 
   */
  public getRemainingSize() {
    return this.size - this.length
  }

  /**
   * 将读取指针回退指定长度
   * 
   * @param length 
   */
  public back(length: number) {
    if (length > this.size - this.length) {
      this.pos -= (this.size - this.length)
      this.valid = this.tail
      this.length = this.size
    }
    else {
      if (this.valid < length) {
        this.valid = this.size - (length - this.valid)
      }
      else {
        this.valid -= length
      }
      this.length += length
      this.pos -= length
    }
  }

  /**
   * 跳过指定长度
   * 
   * @param length 
   */
  public skip(length: number) {
    if (this.length < length) {
      this.valid = this.tail = 0
      this.pos += this.length
      this.length = 0
    }
    else {
      if (this.valid + length > this.size) {
        this.valid = length - (this.size - this.valid)
      }
      else {
        this.valid += length
      }
      this.length -= length
      this.pos += length
    }
  }

  /**
   * 重置缓冲区
   */
  public clear() {
    this.valid = this.tail = this.length = this.pos = 0
  }
}

import { TypeArrayConstructor, TypeArray } from '../types/type'

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

  public getCurrentPointer() {
    return this.valid
  }

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

  public getSize() {
    return this.size
  }

  public getLength() {
    return this.length
  }

  public getPos() {
    return this.pos
  }

  public getRemainingSize() {
    return this.size - this.length
  }

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

  public clear() {
    this.valid = this.tail = this.length = this.pos = 0
  }
}

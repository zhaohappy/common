import BufferWriter from '../io/BufferWriter'
import BufferReader from '../io/BufferReader'
import { BytesReaderSync, BytesReader, BytesWriter, BytesWriterSync } from '../io/interface'
import browser from './browser'
import os from './os'

export const enum SectionId {
  Custom,
  Type,
  Import,
  Function,
  Table,
  Memory,
  Global,
  Export,
  Start,
  Element,
  Code,
  Data
}

export const enum ExternalKind {
  Function,
  Table,
  Memory,
  Global
}

export function readUleb128(reader: BytesReaderSync) {
  let result = 0
  let shift = 0
  while (true) {
    const byte = reader.readUint8()

    result |= (byte & 0x7f) << shift
    shift += 7

    if (!(byte & 0x80)) {
      break
    }
  }
  return result
}

export async function readUleb128Async(reader: BytesReader) {
  let result = 0
  let shift = 0
  while (true) {
    const byte = await reader.readUint8()

    result |= (byte & 0x7f) << shift
    shift += 7

    if (!(byte & 0x80)) {
      break
    }
  }
  return result
}

export function readSleb128(reader: BytesReaderSync) {
  let result = 0
  let shift = 0
  let byte: number
  while (true) {
    byte = reader.readUint8()

    result |= (byte & 0x7f) << shift
    shift += 7

    if (!(byte & 0x80)) {
      break
    }
  }

  // 符号扩展，将最高有效位的符号位扩展到高位
  if (byte & 0x40) {
    // 如果最高有效位是 1（负数），则将高位全部置为 1
    result |= (~0 << shift)
  }

  return result
}

export async function readSleb128Async(reader: BytesReader) {
  let result = 0
  let shift = 0
  let byte: number
  while (true) {
    byte = await reader.readUint8()

    result |= (byte & 0x7f) << shift
    shift += 7

    if (!(byte & 0x80)) {
      break
    }
  }

  // 符号扩展，将最高有效位的符号位扩展到高位
  if (byte & 0x40) {
    // 如果最高有效位是 1（负数），则将高位全部置为 1
    result |= (~0 << shift)
  }

  return result
}

export function writeSleb128(writer: BytesWriterSync, value: number) {
  let more = true
  while (more) {
    let byte = value & 0x7f
    value >>= 7
    // 如果还有未编码的位，设置高位为 1
    if ((value === 0 && (byte & 0x40) === 0) || (value === -1 && (byte & 0x40) !== 0)) {
      more = false
    }
    else {
      byte |= 0x80
    }
    writer.writeUint8(byte)
  }
}

export async function writeSleb128Async(writer: BytesWriter, value: number) {
  let more = true
  while (more) {
    let byte = value & 0x7f
    value >>= 7
    // 如果还有未编码的位，设置高位为 1
    if ((value === 0 && (byte & 0x40) === 0) || (value === -1 && (byte & 0x40) !== 0)) {
      more = false
    }
    else {
      byte |= 0x80
    }
    await writer.writeUint8(byte)
  }
}

export function writeUleb128(writer: BytesWriterSync, value: number) {
  do {
    let byte = value & 0x7f
    value >>= 7
    // 如果还有未编码的位，设置高位为 1
    if (value !== 0) {
      byte |= 0x80
    }
    writer.writeUint8(byte)
  } while (value !== 0)
}

export async function writeUleb128Async(writer: BytesWriter, value: number) {
  do {
    let byte = value & 0x7f
    value >>= 7
    // 如果还有未编码的位，设置高位为 1
    if (value !== 0) {
      byte |= 0x80
    }
    await writer.writeUint8(byte)
  } while (value !== 0)
}

export function setMemoryMeta(wasm: Uint8Array, options: {
  shared: boolean
  maximum?: number
  initial?: number
}) {
  const reader = new BufferReader(wasm, true)
  const writer = new BufferWriter(new Uint8Array(wasm.length + 100), true)

  writer.writeBuffer(reader.readBuffer(8))

  while (reader.remainingSize()) {
    const sectionId = reader.readUint8()
    writer.writeUint8(sectionId)

    const size = readUleb128(reader)

    if (sectionId === SectionId.Import) {

      const importWriter = new BufferWriter(new Uint8Array(size + 100))

      let count = readUleb128(reader)
      writeUleb128(importWriter, count)

      while (count--) {
        const moduleLen = readUleb128(reader)
        writeUleb128(importWriter, moduleLen)
        importWriter.writeBuffer(reader.readBuffer(moduleLen))
        const fieldLen = readUleb128(reader)
        writeUleb128(importWriter, fieldLen)
        importWriter.writeBuffer(reader.readBuffer(fieldLen))
        const externalKind = reader.readUint8()
        importWriter.writeUint8(externalKind)
        switch (externalKind) {
          case ExternalKind.Function: {
            // type index of the function signature
            writeUleb128(importWriter, readUleb128(reader))
            break
          }
          case ExternalKind.Global: {
            // content_type
            writeSleb128(importWriter, readSleb128(reader))
            // mutability
            writeUleb128(importWriter, readUleb128(reader))
            break
          }
          case ExternalKind.Memory: {
            let flags = readUleb128(reader)
            if (options.shared) {
              writeUleb128(importWriter, flags | 2)
            }
            else {
              writeUleb128(importWriter, flags & ~2)
            }
            const initial = readUleb128(reader)
            writeUleb128(importWriter, options.initial || initial)
            if (flags & 0x01) {
              let maximum = readUleb128(reader)
              if (options.maximum && (!(os.ios && !browser.checkVersion(os.version, '17', true)) || !options.shared)) {
                maximum = options.maximum
              }
              writeUleb128(importWriter, maximum)
            }
            break
          }
          case ExternalKind.Table: {
            // elem_type
            writeSleb128(importWriter, readSleb128(reader))
            const flags = readUleb128(reader)
            writeUleb128(importWriter, flags)
            writeUleb128(importWriter, readUleb128(reader))
            if (flags & 0x01) {
              // maximum
              writeUleb128(importWriter, readUleb128(reader))
            }
            break
          }
        }
      }
      const buffer = importWriter.getWroteBuffer()
      writeUleb128(writer, buffer.length)
      writer.writeBuffer(buffer)
    }
    else {
      writeUleb128(writer, size)
      writer.writeBuffer(reader.readBuffer(size))
    }
  }
  return writer.getWroteBuffer()
}

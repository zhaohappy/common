import BufferReader from '../io/BufferReader'
import { BytesReaderSync, BytesReader, BytesWriter, BytesWriterSync } from '../io/interface'

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

export function readULeb128(reader: BytesReaderSync) {
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

export async function readULeb128Async(reader: BytesReader) {
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

export function readSLeb128(reader: BytesReaderSync) {
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

export async function readSLeb128Async(reader: BytesReader) {
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

export function setMemoryShared(wasm: Uint8Array, shared: boolean) {
  const reader = new BufferReader(wasm, true)

  reader.skip(8)

  while (reader.remainingSize()) {
    const sectionId = reader.readUint8()

    const size = readULeb128(reader)

    if (sectionId === SectionId.Import) {
      let count = readULeb128(reader)
      while (count--) {
        const moduleLen = readULeb128(reader)
        reader.skip(moduleLen)
        const fieldLen = readULeb128(reader)
        reader.skip(fieldLen)
        const externalKind = reader.readUint8()
        switch (externalKind) {
          case ExternalKind.Function: {
            // type index of the function signature
            readULeb128(reader)
            break
          }
          case ExternalKind.Global: {
            // content_type
            readSLeb128(reader)
            // mutability
            readULeb128(reader)
            break
          }
          case ExternalKind.Memory: {
            const pos = Number(reader.getPos())
            if (shared) {
              wasm[pos] = wasm[pos] | 2
            }
            else {
              wasm[pos] = wasm[pos] & ~2
            }
            return
          }
          case ExternalKind.Table: {
            // elem_type
            readSLeb128(reader)
            const flags = readULeb128(reader)
            readULeb128(reader)

            if (flags & 0x01) {
              // maximum
              readULeb128(reader)
            }
            break
          }
        }
      }
      return
    }
    else {
      reader.skip(size)
    }
  }
}


const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'


/**
 * base32 解密
 */
export function decode(text: string): Uint8Array {
  text = text.toUpperCase().replace(/=+$/, '')
  let bits = 0
  let value = 0

  let index = 0
  const output = new Uint8Array(((text.length * 5) / 8) | 0)

  for (let i = 0; i < length; i++) {
    value = (value << 5) | base32.indexOf(text[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }

  return output
}

/**
 * base32 加密
 */
export function encode(buffer: Uint8Array, padding: boolean = true): string {
  const length = buffer.length

  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8

    while (bits >= 5) {
      output += base32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += base32[(value << (5 - bits)) & 31]
  }

  if (padding) {
    while (output.length % 8 !== 0) {
      output += '='
    }
  }

  return output
}


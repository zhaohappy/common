const encoder = typeof TextEncoder === 'function' ? new TextEncoder() : null
const decoder = typeof TextDecoder === 'function' ? new TextDecoder() : null

export function encode(data: string) {
  if (encoder) {
    return encoder.encode(data)
  }

  const array = []

  for (let i = 0; i < data.length; ++i) {
    let u = data.charCodeAt(i)
    if (u >= 55296 && u <= 57343) {
      let u1 = data.charCodeAt(++i)
      u = 65536 + ((u & 1023) << 10) | u1 & 1023
    }
    if (u <= 127) {
      array.push(u)
    }
    else if (u <= 2047) {
      array.push(192 | u >> 6)
      array.push(128 | u & 63)
    }
    else if (u <= 65535) {
      array.push(224 | u >> 12)
      array.push(128 | u >> 6 & 63)
      array.push(128 | u & 63)
    }
    else {
      array.push(240 | u >> 18)
      array.push(128 | u >> 12 & 63)
      array.push(128 | u >> 6 & 63)
      array.push(128 | u & 63)
    }
  }
  return new Uint8Array(array)
}

function decodeJS(data: Uint8Array | number[]) {
  let result = ''

  for (let i = 0; i < data.length;) {
    let u0 = data[i++ >>> 0]
    if (!(u0 & 128)) {
      result += String.fromCharCode(u0)
      continue
    }
    let u1 = data[i++ >>> 0] & 63
    if ((u0 & 224) == 192) {
      result += String.fromCharCode((u0 & 31) << 6 | u1)
      continue
    }
    let u2 = data[i++ >>> 0] & 63
    if ((u0 & 240) == 224) {
      u0 = (u0 & 15) << 12 | u1 << 6 | u2
    }
    else {
      u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | data[i++ >>> 0] & 63
    }
    if (u0 < 65536) {
      result += String.fromCharCode(u0)
    }
    else {
      let ch = u0 - 65536
      result += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
    }
  }
  return result
}

export function decode(data: Uint8Array | number[]) {
  if (data instanceof Uint8Array && decoder && !(typeof SharedArrayBuffer === 'function' && data.buffer instanceof SharedArrayBuffer)) {
    try {
      // chrome 偶现 data.buffer instanceof SharedArrayBuffer 返回 false 但其实是 SharedArrayBuffer 的情况
      return decoder.decode(data)
    }
    catch (error) {
      return decodeJS(data)
    }
  }
  return decodeJS(data)
}

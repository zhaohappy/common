
import * as array from './array'

const base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

/**
 * utf8 编码
 * @param text 
 */
function utf8Decode(text: string): string {
  let string = '', i = 0, c = 0, c1 = 0, c2 = 0, c3 = 0
  while (i < text.length) {
    c = text.charCodeAt(i)
    if (c < 128) {
      string += String.fromCharCode(c)
      i++
    }
    else if ((c > 191) && (c < 224)) {
      c2 = text.charCodeAt(i + 1)
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
      i += 2
    }
    else {
      c2 = text.charCodeAt(i + 1)
      c3 = text.charCodeAt(i + 2)
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
      i += 3
    }
  }
  return string
}

/**
 * base64 解密
 */
export function base64Decode(text: string): string {
  let output: string = ''
  let chr1: number, chr2: number, chr3: number, enc1: number, enc2: number, enc3: number, enc4: number, i = 0
  text = text.replace(/[^A-Za-z0-9\+\/\=]/g, '')

  // 不是 4 的倍数补齐 =
  while (text.length % 4) {
    text += '='
  }

  while (i < text.length) {
    enc1 = base64.indexOf(text.charAt(i++))
    enc2 = base64.indexOf(text.charAt(i++))
    enc3 = base64.indexOf(text.charAt(i++))
    enc4 = base64.indexOf(text.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output += String.fromCharCode(chr1)
    if (enc3 !== 64) {
      output += String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(chr3)
    }
  }
  return utf8Decode(output)
}

function atobCustom(encodedString: string) {
  function decodeBase64(char: string) {
    const index = base64.indexOf(char)
    return index === -1 ? 0 : index
  }

  let decodedString = ''

  for (let i = 0; i < encodedString.length;) {
    const enc1 = decodeBase64(encodedString[i++])
    const enc2 = decodeBase64(encodedString[i++])
    const enc3 = decodeBase64(encodedString[i++])
    const enc4 = decodeBase64(encodedString[i++])

    const chr1 = (enc1 << 2) | (enc2 >> 4)
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    const chr3 = ((enc3 & 3) << 6) | enc4

    decodedString += String.fromCharCode(chr1)

    if (enc3 !== 64) {
      decodedString += String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      decodedString += String.fromCharCode(chr3)
    }
  }
  return decodedString
}

export function base64ToUint8Array(string: string) {
  const binaryData = typeof atob === 'function' ? atob(string) : atobCustom(string)
  const uint8Array = new Uint8Array(binaryData.length)
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i)
  }
  return uint8Array
}

export const list = [
  'A', 'B', 'C', 'D', 'E', 'F',
  'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'a', 'b', 'c', 'd',
  'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p',
  'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1',
  '2', '3', '4', '5', '6', '7',
  '8', '9', '+', '/'
]

const _map: Record<string, number> = { }

array.each(list, (char, index) => {
  _map[char] = index
})

export const map = _map


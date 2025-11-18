import isDef from './isDef'

let _isLittleEndian: boolean

export default function isLittleEndian() {

  if (isDef(_isLittleEndian)) {
    return _isLittleEndian
  }

  const buf = new ArrayBuffer(2)
  const view = new DataView(buf)

  // little-endian write
  view.setInt16(0, 256, true)
  // platform-spec read, if equal then LE
  _isLittleEndian = (new Int16Array(buf))[0] === 256

  return _isLittleEndian
}

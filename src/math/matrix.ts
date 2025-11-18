import Matrix3 from './Matrix3'
import Matrix4 from './Matrix4'

export function concat3x3(a: Matrix3, b: Matrix3) {
  const m = new Matrix3([0, 0, 0, 0, 0, 0, 0, 0, 0])
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let value = a.rc(r, 0) * b.rc(0, c) + a.rc(r, 1) * b.rc(1, c) + a.rc(r, 2) * b.rc(2, c)
      m.setRC(r, c, value)
    }
  }
  return m
}

export function concat4x4(a: Matrix4, b: Matrix4) {
  const m = new Matrix4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let value = a.rc(r, 0) * b.rc(0, c) + a.rc(r, 1) * b.rc(1, c) + a.rc(r, 2) * b.rc(2, c) + a.rc(r, 3) * b.rc(3, c)
      m.setRC(r, c, value)
    }
  }
  return m
}

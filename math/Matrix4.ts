import * as array from '../util/array'
import * as logger from '../util/logger'
import { Vector3, Vector4 } from './Vector3'

let shared: Matrix4 | void

export default class Matrix4 {
  /**
   * 全局单例
   */
  public static shared(): Matrix4 {
    return shared || (shared = new Matrix4())
  }

  public static RowMajor(matrix: number[]) {
    return new Matrix4([
      matrix[0], matrix[4], matrix[8], matrix[12],
      matrix[1], matrix[5], matrix[9], matrix[13],
      matrix[2], matrix[6], matrix[10], matrix[14],
      matrix[3], matrix[7], matrix[11], matrix[15]
    ])
  }

  public static ColMajor(matrix: number[]) {
    return new Matrix4(matrix)
  }

  element: Float32Array

  constructor(matrix?: number[]) {
    if (matrix) {
      this.element = new Float32Array(16)
      this.set(matrix)
    }
    else {
      this.element = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    }
  }

  rc(r: number, c: number) {
    return this.getValue(c * 4 + r)
  }

  setRC(r: number, c: number, value: number) {
    this.setValue(c * 4 + r, value)
  }

  getValue(index: number): number {
    if (index >= 0 && index <= 15) {
      return this.element[index]
    }
    else {
      logger.error('index out of Matrix4\'s rang [0 - 15]')
    }
  }

  setValue(index: number, value: number) {
    if (index >= 0 && index <= 15) {
      this.element[index] = value
    }
    else {
      logger.error('index out of Matrix4\'s rang [0 - 15]')
    }
  }

  /**
   * 设置成单位矩阵
   */
  setIdentity(): Matrix4 {
    this.element = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])

    return this
  }

  /**
   * 设置矩阵值
   * @param matrix 
   */
  set(matrix: number[]): Matrix4 {
    array.each(matrix, (value, index) => {
      this.element[index] = value
    })
    return this
  }

  /**
   * 矩阵乘法
   * @param matrix 
   */
  multiply(matrix: Matrix4): Matrix4 {
    let i: number,
        a: Float32Array,
        b: Float32Array,
        e: Float32Array,
        ai0: number,
        ai1: number,
        ai2: number,
        ai3: number

    e = a = this.element
    b = matrix.element

    if (e === b) {
      b = new Float32Array(16)
      for (i = 0; i < 16; i++) {
        b[i] = e[i]
      }
    }

    for (i = 0; i < 4; i++) {
      ai0 = a[i]
      ai1 = a[i + 4]
      ai2 = a[i + 8]
      ai3 = a[i + 12]

      e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3]
      e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7]
      e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11]
      e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15]
    }

    return this
  }

  /**
   * 矩阵乘以 3 维向量
   * @param vector3 
   */
  multiplyVector3(vector3: Vector3): Vector3 {
    let e = this.element
    let p = vector3.element

    return new Vector3([
      p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + e[12],
      p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + e[13],
      p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[14]
    ])
  }

  /**
   * 矩阵乘以 4 维向量
   * @param vector4 
   */
  multiplyVector4(vector4: Vector4): Vector4 {
    let e = this.element
    let p = vector4.element

    return new Vector4([
      p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + p[3] * e[12],
      p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + p[3] * e[13],
      p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14],
      p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15]
    ])
  }

  /**
   * 矩阵转置
   */
  transpose(): Matrix4 {
    let e: Float32Array, t: number
    e = this.element
    t = e[1], e[1] = e[4], e[4] = t
    t = e[2], e[2] = e[8], e[8] = t
    t = e[3], e[3] = e[12], e[12] = t
    t = e[6], e[6] = e[9], e[9] = t
    t = e[7], e[7] = e[13], e[13] = t
    t = e[11], e[11] = e[14], e[14] = t
    return this
  }

  /**
   * 求特定矩阵的逆矩阵，并设置成当前矩阵
   * @param matrix 
   */
  setInverseOf(matrix: Matrix4): Matrix4 {
    let i: number, s: Float32Array, d: Float32Array, inv: Float32Array, det: number

    s = matrix.element
    d = this.element
    inv = new Float32Array(16)

    inv[0] = s[5] * s[10] * s[15] - s[5] * s[11] * s[14] - s[9] * s[6] * s[15] + s[9] * s[7] * s[14] + s[13] * s[6] * s[11] - s[13] * s[7] * s[10]
    inv[1] = -s[1] * s[10] * s[15] + s[1] * s[11] * s[14] + s[9] * s[2] * s[15] - s[9] * s[3] * s[14] - s[13] * s[2] * s[11] + s[13] * s[3] * s[10]
    inv[2] = s[1] * s[6] * s[15] - s[1] * s[7] * s[14] - s[5] * s[2] * s[15] + s[5] * s[3] * s[14] + s[13] * s[2] * s[7] - s[13] * s[3] * s[6]
    inv[3] = -s[1] * s[6] * s[11] + s[1] * s[7] * s[10] + s[5] * s[2] * s[11] - s[5] * s[3] * s[10] - s[9] * s[2] * s[7] + s[9] * s[3] * s[6]
    inv[4] = -s[4] * s[10] * s[15] + s[4] * s[11] * s[14] + s[8] * s[6] * s[15] - s[8] * s[7] * s[14] - s[12] * s[6] * s[11] + s[12] * s[7] * s[10]
    inv[5] = s[0] * s[10] * s[15] - s[0] * s[11] * s[14] - s[8] * s[2] * s[15] + s[8] * s[3] * s[14] + s[12] * s[2] * s[11] - s[12] * s[3] * s[10]
    inv[6] = -s[0] * s[6] * s[15] + s[0] * s[7] * s[14] + s[4] * s[2] * s[15] - s[4] * s[3] * s[14] - s[12] * s[2] * s[7] + s[12] * s[3] * s[6]
    inv[7] = s[0] * s[6] * s[11] - s[0] * s[7] * s[10] - s[4] * s[2] * s[11] + s[4] * s[3] * s[10] + s[8] * s[2] * s[7] - s[8] * s[3] * s[6]
    inv[8] = s[4] * s[9] * s[15] - s[4] * s[11] * s[13] - s[8] * s[5] * s[15] + s[8] * s[7] * s[13] + s[12] * s[5] * s[11] - s[12] * s[7] * s[9]
    inv[9] = -s[0] * s[9] * s[15] + s[0] * s[11] * s[13] + s[8] * s[1] * s[15] - s[8] * s[3] * s[13] - s[12] * s[1] * s[11] + s[12] * s[3] * s[9]
    inv[10] = s[0] * s[5] * s[15] - s[0] * s[7] * s[13] - s[4] * s[1] * s[15] + s[4] * s[3] * s[13] + s[12] * s[1] * s[7] - s[12] * s[3] * s[5]
    inv[11] = -s[0] * s[5] * s[11] + s[0] * s[7] * s[9] + s[4] * s[1] * s[11] - s[4] * s[3] * s[9] - s[8] * s[1] * s[7] + s[8] * s[3] * s[5]
    inv[12] = -s[4] * s[9] * s[14] + s[4] * s[10] * s[13] + s[8] * s[5] * s[14] - s[8] * s[6] * s[13] - s[12] * s[5] * s[10] + s[12] * s[6] * s[9]
    inv[13] = s[0] * s[9] * s[14] - s[0] * s[10] * s[13] - s[8] * s[1] * s[14] + s[8] * s[2] * s[13] + s[12] * s[1] * s[10] - s[12] * s[2] * s[9]
    inv[14] = -s[0] * s[5] * s[14] + s[0] * s[6] * s[13] + s[4] * s[1] * s[14] - s[4] * s[2] * s[13] - s[12] * s[1] * s[6] + s[12] * s[2] * s[5]
    inv[15] = s[0] * s[5] * s[10] - s[0] * s[6] * s[9] - s[4] * s[1] * s[10] + s[4] * s[2] * s[9] + s[8] * s[1] * s[6] - s[8] * s[2] * s[5]

    det = s[0] * inv[0] + s[1] * inv[4] + s[2] * inv[8] + s[3] * inv[12]
    if (det === 0) {
      return this
    }
    det = 1 / det
    for (i = 0; i < 16; i++) {
      d[i] = inv[i] * det
    }
    return this
  }

  /**
   * 求自身的逆矩阵
   */
  invert(): Matrix4 {
    this.setInverseOf(this)
    return this
  }

  /**
   * 设置成正射投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
    let rw: number, rh: number, rd: number
    if (left === right || bottom === top || near === far) {
      logger.fatal('null frustum')
    }

    rw = 1 / (right - left)
    rh = 1 / (top - bottom)
    rd = 1 / (far - near)

    this.set([
      2 * rw, 0, 0, 0,
      0, 2 * rh, 0, 0,
      0, 0, -2 * rd, 0,
      -(right + left) * rw, -(top + bottom) * rh, -(far + near) * rd, 1
    ])
    return this
  }

  /**
   * 右乘正射投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4  {
    return this.multiply(new Matrix4().setOrtho(left, right, bottom, top, near, far))
  }

  /**
   * 设置成透视投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
    let rw: number, rh: number, rd: number
    if (left === right || bottom === top || near === far) {
      logger.error('null frustum')
    }
    if (near <= 0) {
      logger.fatal('near <= 0')
    }
    if (far <= 0) {
      logger.fatal('far <= 0')
    }

    rw = 1 / (right - left)
    rh = 1 / (top - bottom)
    rd = 1 / (far - near)

    this.set([
      2 * near * rw, 0, 0, 0,
      0, 2 * near * rh, 0, 0,
      (right + left) * rw, (top + bottom) * rh, -(far + near) * rd, -1,
      0, 0, -2 * near * far * rd, 0
    ])
    return this
  }

  /**
   * 右乘透视投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4  {
    return this.multiply(new Matrix4().setOrtho(left, right, bottom, top, near, far))
  }

  /**
   * 设置成透视投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  setPerspective(fovy: number, aspect: number, near: number, far: number): Matrix4 {
    let rd: number, s: number, ct: number
    if (near === far || aspect === 0) {
      logger.fatal('null frustum')
    }
    if (near <= 0) {
      logger.fatal('near <= 0')
    }
    if (far <= 0) {
      logger.fatal('far <= 0')
    }

    fovy = Math.PI * fovy / 180 / 2

    s = Math.sin(fovy)

    if (s === 0) {
      logger.fatal('null frustum')
    }

    rd = 1 / (far - near)
    ct = Math.cos(fovy) / s

    this.set([
      ct / aspect, 0, 0, 0,
      0, ct, 0, 0,
      0, 0, -(far + near) * rd, -1,
      0, 0, -2 * near * far * rd, 0
    ])
    return this
  }

  /**
   * 右乘透视投影矩阵
   * @param left 
   * @param right 
   * @param bottom 
   * @param top 
   * @param near 
   * @param far 
   */
  perspective(fovy: number, aspect: number, near: number, far: number): Matrix4 {
    return this.multiply(new Matrix4().setPerspective(fovy, aspect, near, far))
  }

  /**
   * 将 Matrix4 实例设置为缩放变换矩阵
   * @param vector3 缩放因子
   */
  setScale(vector3: Vector3): Matrix4 {
    this.set([
      vector3.x, 0, 0, 0,
      0, vector3.y, 0, 0,
      0, 0, vector3.z, 0,
      0, 0, 0, 1
    ])
    return this
  }

  /**
   * 右乘缩放变换矩阵
   * @param vector3 缩放因子
   */
  scale(vector3: Vector3): Matrix4 {
    let e = this.element
    e[0] *= vector3.x, e[1] *= vector3.x, e[2] *= vector3.x, e[3] *= vector3.x
    e[4] *= vector3.y, e[5] *= vector3.y, e[6] *= vector3.y, e[7] *= vector3.y
    e[8] *= vector3.z, e[9] *= vector3.z, e[10] *= vector3.z, e[11] *= vector3.z
    return this
  }

  /**
   * 将 Matrix4 实例设置为平移变换矩阵
   * @param vector3 平移因子
   */
  setTranslate(vector3: Vector3): Matrix4 {
    this.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      vector3.x, vector3.y, vector3.z, 1
    ])
    return this
  }

  /**
   * 右乘平移变换矩阵
   * @param vector3 平移因子
   */
  preTranslate(vector3: Vector3): Matrix4 {
    let e = this.element
    e[12] += e[0] * vector3.x + e[4] * vector3.y + e[8] * vector3.z
    e[13] += e[1] * vector3.x + e[5] * vector3.y + e[9] * vector3.z
    e[14] += e[2] * vector3.x + e[6] * vector3.y + e[10] * vector3.z
    e[15] += e[3] * vector3.x + e[7] * vector3.y + e[11] * vector3.z
    return this
  }

  /**
   * 左乘平移变换矩阵
   * @param vector3 平移因子
   */
  postTranslate(vector3: Vector3): Matrix4 {
    let e = this.element
    e[0] += vector3.x * e[3]
    e[1] += vector3.y * e[3]
    e[2] += vector3.z * e[3]

    e[4] += vector3.x * e[7]
    e[5] += vector3.y * e[7]
    e[6] += vector3.z * e[7]

    e[8] += vector3.x * e[11]
    e[9] += vector3.y * e[11]
    e[10] += vector3.z * e[11]

    e[12] += vector3.x * e[15]
    e[13] += vector3.y * e[15]
    e[14] += vector3.z * e[15]
    return this
  }

  /**
   * 将 Matrix4  实例设置为旋转变换矩阵
   * @param angle 旋转角度（角度制 0-360）
   * @param vector3 旋转轴
   */
  setRotate(angle: number, vector3: Vector3): Matrix4 {
    let x: number, y: number, z: number, s: number, c: number, len: number,
        rlen: number, nc: number, xy: number, yz: number,
        zx: number, xs: number, ys: number, zs: number

    angle = Math.PI * angle / 180

    x = vector3.x
    y = vector3.y
    z = vector3.z

    s = Math.sin(angle)
    c = Math.cos(angle)

    if (0 !== vector3.x && 0 === vector3.y && 0 === vector3.z) {
      // Rotation around X axis
      if (vector3.x < 0) {
        s = -s
      }
      this.set([
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
      ])
    }
    else if (0 === vector3.x && 0 !== vector3.y && 0 === vector3.z) {
      // Rotation around Y axis
      if (vector3.y < 0) {
        s = -s
      }
      this.set([
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
      ])
    }
    else if (0 === vector3.x && 0 === vector3.y && 0 !== vector3.z) {
      // Rotation around Z axis
      if (vector3.z < 0) {
        s = -s
      }
      this.set([
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    }
    else {
      // Rotation around another axis
      len = vector3.magnitude
      if (len !== 1) {
        rlen = 1 / len
        x *= rlen
        y *= rlen
        z *= rlen
      }
      nc = 1 - c
      xy = x * y
      yz = y * z
      zx = z * x
      xs = x * s
      ys = y * s
      zs = z * s

      this.set([
        x * x * nc + c, xy * nc + zs, zx * nc - ys, 0,
        xy * nc - zs, y * y * nc + c, yz * nc + xs, 0,
        zx * nc + ys, yz * nc - xs, z * z * nc + c, 0,
        0, 0, 0, 1
      ])
    }
    return this
  }

  /**
   * 右乘旋转矩阵
   * @param angle 旋转角度（角度制 0-360）
   * @param vector3 旋转轴
   */
  rotate(angle: number, vector3: Vector3): Matrix4 {
    this.multiply(new Matrix4().setRotate(angle, vector3))
    return this
  }

  /**
   * 设置成一个观察矩阵
   * @param eye 视点
   * @param center 目标
   * @param up 上方向
   */
  setLookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4 {
    let fx: number, fy: number, fz: number, rlf: number,
        sx: number, sy: number, sz: number, rls: number,
        ux: number, uy: number, uz: number

    fx = center.x - eye.x
    fy = center.y - eye.y
    fz = center.z - eye.z

    // Normalize f.
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz)
    fx *= rlf
    fy *= rlf
    fz *= rlf

    // Calculate cross product of f and up.
    sx = fy * up.z - fz * up.y
    sy = fz * up.x - fx * up.z
    sz = fx * up.y - fy * up.x

    // Normalize s.
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz)
    sx *= rls
    sy *= rls
    sz *= rls

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy
    uy = sz * fx - sx * fz
    uz = sx * fy - sy * fx

    this.set([
      sx, ux, -fx, 0,
      sy, uy, -fy, 0,
      sz, uz, -fz, 0,
      0, 0, 0, 1
    ])

    // Translate.
    return this.preTranslate(new Vector3([-eye.x, -eye.y, -eye.z]))
  }

  /**
   * 右乘视图矩阵
   * @param eye 视点
   * @param center 目标
   * @param up 上方向
   */
  lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4 {
    return this.multiply(new Matrix4().setLookAt(eye, center, up))
  }

  toArray(): number[] {
    let result = []
    for (let i = 0; i < 16; i++) {
      result[i] = this.element[i]
    }
    return result
  }

  copy(): Matrix4 {
    return new Matrix4().set(this.toArray())
  }
}

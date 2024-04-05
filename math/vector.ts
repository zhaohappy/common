import Matrix3 from './Matrix3'
import Matrix4 from './Matrix4'
import { Vector3 } from './Vector3'

/**
 * 向量加法
 */
export function add(a: Vector3, b: Vector3): Vector3 {
  return new Vector3([
    a.x + b.x,
    a.y + b.y,
    a.z + b.z
  ])
}

/**
 * 向量减法
 */
export function minus(a: Vector3, b: Vector3): Vector3 {
  return new Vector3([
    a.x - b.x,
    a.y - b.y,
    a.z - b.z
  ])
}

/**
 * 向量乘以标量
 */
export function scalarProduct(vector: Vector3, scalar: number): Vector3 {
  return new Vector3([
    vector.x * scalar,
    vector.y * scalar,
    vector.z * scalar
  ])
}

/**
 * 向量点乘
 */
export function dotProduct(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

/**
 * 向量叉乘
 */
export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return new Vector3([
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  ])
}

/**
 * 向量旋转
 */
export function rotate(vector: Vector3, angle: number, axis: Vector3): Vector3 {
  return new Matrix4().setRotate(angle, axis).multiplyVector3(vector)
}

/**
 * 求两个向量的单位法向量
 */
export function vertical(a: Vector3, b: Vector3): Vector3 {
  return crossProduct(a, b).normalize()
}

/**
 * 求两个向量的夹角余弦值
 */
export function angleCos(a: Vector3, b: Vector3): number {
  return dotProduct(a, b) / (a.magnitude * b.magnitude)
}

/**
 * 求两个向量的夹角
 */
export function angle(a: Vector3, b: Vector3): number {
  return Math.acos(angleCos(a, b))
}

/**
 * 求两个向量的线段拓展向量
 */
export function extendPoint(a: Vector3, b: Vector3): Vector3 {
  let sum = add(a, b)
  // 如果向量 a 和向量 b 方向相反，长度相等，则直接使用向量 a 或者向量 b 计算，因为其合向量为 0，使用其中一个即可计算出正交向量
  if (sum.magnitude === 0) {
    sum = a
  }
  return crossProduct(sum, new Vector3([0, 0, 1])).normalize()
}

/**
 * 矩阵向量相乘
 */
export function mvMul(m: Matrix3, v: Vector3) {
  const dst = new Vector3([0, 0, 0])
  for (let row = 0; row < 3; row++) {
    dst.element[row] = m.rc(row, 0) * v.x + m.rc(row, 1) * v.y + m.rc(row, 2) * v.z
  }
  return dst
}

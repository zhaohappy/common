import * as array from '../util/array'
import * as logger from '../util/logger'

export default class Matrix3 {

  element: Float32Array

  public static RowMajor(matrix: number[]) {
    return new Matrix3([
      matrix[0], matrix[3], matrix[6],
      matrix[1], matrix[4], matrix[7],
      matrix[2], matrix[5], matrix[8]
    ])
  }

  public static ColMajor(matrix: number[]) {
    return new Matrix3(matrix)
  }

  constructor(matrix?: number[]) {
    if (matrix) {
      this.element = new Float32Array(9)
      this.set(matrix)
    }
    else {
      this.element = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ])
    }
  }

  rc(r: number, c: number) {
    return this.getValue(c * 3 + r)
  }

  setRC(r: number, c: number, value: number) {
    this.setValue(c * 3 + r, value)
  }

  getValue(index: number): number {
    if (index >= 0 && index < 9) {
      return this.element[index]
    }
    else {
      logger.error('index out of Matrix4\'s rang [0 - 9]')
    }
  }

  setValue(index: number, value: number) {
    if (index >= 0 && index < 9) {
      this.element[index] = value
    }
    else {
      logger.error('index out of Matrix4\'s rang [0 - 9]')
    }
  }

  /**
   * 设置成单位矩阵
   */
  setIdentity(): Matrix3 {
    this.element = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ])
    return this
  }

  /**
   * 设置矩阵值
   * @param matrix 
   */
  set(matrix: number[]): Matrix3 {
    array.each(matrix, (value, index) => {
      this.element[index] = value
    })
    return this
  }

  public invert() {
    const te = this.element,

        n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ],
        n12 = te[ 3 ], n22 = te[ 4 ], n32 = te[ 5 ],
        n13 = te[ 6 ], n23 = te[ 7 ], n33 = te[ 8 ],

        t11 = n33 * n22 - n32 * n23,
        t12 = n32 * n13 - n33 * n12,
        t13 = n23 * n12 - n22 * n13,

        det = n11 * t11 + n21 * t12 + n31 * t13

    if ( det === 0 ) {
      return this.set([0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    const detInv = 1 / det

    te[ 0 ] = t11 * detInv
    te[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv
    te[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv

    te[ 3 ] = t12 * detInv
    te[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv
    te[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv

    te[ 6 ] = t13 * detInv
    te[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv
    te[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv

    return this
  }

  toArray(): number[] {
    let result = []
    for (let i = 0; i < 9; i++) {
      result[i] = this.element[i]
    }
    return result
  }

  copy(): Matrix3 {
    return new Matrix3().set(this.toArray())
  }
}

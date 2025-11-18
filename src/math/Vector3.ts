export class Vector3 {

  element: Float32Array

  constructor(vector?: number[]) {
    this.element = new Float32Array(3)
    if (vector) {
      this.element[0] = vector[0]
      this.element[1] = vector[1]
      this.element[2] = vector[2]
    }
  }

  /** 
   * 归一化
   */
  normalize(): Vector3 {
    let c = this.x, d = this.y, e = this.z, g = this.magnitude
    if (g) {
      if (g === 1) {
        return this
      }
      else {
        g = 1 / g
        this.x = c * g
        this.y = d * g
        this.z = e * g
        return this
      }
    }
    else {
      this.x = this.y = this.z = 0
      return this
    }
  }

  toArray(): number [] {
    return [this.x, this.y, this.z]
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  get sqrMagnitude() {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }

  get x(): number {
    return this.element[0]
  }

  set x(value: number) {
    this.element[0] = value
  }

  get y(): number {
    return this.element[1]
  }

  set y(value: number) {
    this.element[1] = value
  }

  get z(): number {
    return this.element[2]
  }

  set z(value: number) {
    this.element[2] = value
  }
}

export class Vector4 {

  element: Float32Array

  constructor(vector?: number[]) {
    this.element = new Float32Array(4)
    if (vector) {
      this.element[0] = vector[0]
      this.element[1] = vector[1]
      this.element[2] = vector[2]
      this.element[4] = vector[3]
    }
  }
}


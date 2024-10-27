export default class LinearFitting {

  private x: number[]
  private y: number[]
  private max: number

  private slope: number
  private intercept: number

  constructor(max: number = 20) {
    this.max = max
    this.x = []
    this.y = []
  }

  public push(x: number, y: number) {
    this.x.push(x)
    this.y.push(y)

    if (this.x.length === this.max) {
      this.x.shift()
    }
    if (this.y.length === this.max) {
      this.y.shift()
    }

    if (this.x.length > 1) {
      const n = this.x.length
      const sumX = this.x.reduce((acc, xi) => acc + xi, 0)
      const sumY = this.y.reduce((acc, yi) => acc + yi, 0)
      const sumXY = this.x.reduce((acc, xi, i) => acc + xi * this.y[i], 0)
      const sumX2 = this.x.reduce((acc, xi) => acc + xi * xi, 0)
      this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      this.intercept = (sumY - this.slope * sumX) / n
    }
  }

  public canTransform() {
    return this.x.length > 1
  }

  public y2x(y: number) {
    return (y - this.intercept) / this.slope
  }

  public x2y(x: number) {
    return this.slope * x + this.intercept
  }
}

/*
 * compute an Exponential Weighted moving average
 * - https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average
 *  - heavily inspired from shaka-player
 */

export default class EWMA {
  public readonly halfLife: number
  private alpha: number
  private estimate: number
  private totalWeight: number

  //  About half of the estimated value will be from the last |halfLife| samples by weight.
  constructor(halfLife: number, estimate: number = 0, weight: number = 0) {
    this.halfLife = halfLife
    // Larger values of alpha expire historical data more slowly.
    this.alpha = halfLife ? Math.exp(Math.log(0.5) / halfLife) : 0
    this.estimate = estimate
    this.totalWeight = weight
  }

  sample(weight: number, value: number) {
    const adjAlpha = Math.pow(this.alpha, weight)
    this.estimate = value * (1 - adjAlpha) + adjAlpha * this.estimate
    this.totalWeight += weight
  }

  getTotalWeight(): number {
    return this.totalWeight
  }

  getEstimate(): number {
    if (this.alpha) {
      const zeroFactor = 1 - Math.pow(this.alpha, this.totalWeight)
      if (zeroFactor) {
        return this.estimate / zeroFactor
      }
    }
    return this.estimate
  }
}

import getTimestamp from '../function/getTimestamp'

export default class MasterTimer {

  base: bigint = 0n

  rate: bigint = 1000n

  startTimestamp: bigint = 0n

  public start() {
    this.base = 0n
    this.startTimestamp = BigInt(getTimestamp())
  }

  public getMasterTime() {
    return this.base + ((BigInt(getTimestamp()) - this.startTimestamp) * this.rate) / 1000n
  }

  public setRate(rate: number) {
    this.base = this.getMasterTime()
    this.startTimestamp = BigInt(getTimestamp())
    this.rate = BigInt((rate * 1000) >>> 0)
  }

  public setMasterTime(time: bigint) {
    this.base = time
    this.startTimestamp = BigInt(getTimestamp())
  }
}

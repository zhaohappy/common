
import * as is from '../util/is'
export default abstract class ArrayLike {

  protected proxy: ArrayLike

  constructor() {
    this.proxy = new Proxy(this, {
      get(target, p, receiver) {
        if (is.numeric(p)) {
          return target.getIndexValue(+p)
        }
        else {
          return target[p]
        }
      },
      set(target, p, newValue, receiver) {
        if (is.numeric(p)) {
          target.setIndexValue(+p, newValue)
        }
        else {
          target[p] = newValue
        }
        return true
      }
    })
  }

  protected abstract getIndexValue(index: number): any
  protected abstract setIndexValue(index: number, value: any): void

  [n: number]: number
}

/***
 * 返回 比 num 大的最接近 num 的 2 幂次方数
 */
export default function nearestPowerOf2(num: number) {
  if (num <= 0) {
    return 1
  }
  return Math.pow(2, Math.ceil(Math.log2(num)))
}

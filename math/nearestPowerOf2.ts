export default function nearestPowerOf2(num) {
  if (num <= 0) {
    return 1
  }
  return Math.pow(2, Math.ceil(Math.log2(num)))
}

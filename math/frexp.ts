export default function frexp(value: number) {
  if (value === 0) {
    return { mantissa: 0, exponent: 0 }
  }
  const exponent = Math.floor(Math.log2(Math.abs(value))) + 1
  const mantissa = value / Math.pow(2, exponent)
  return { mantissa, exponent }
}

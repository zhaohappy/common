export function abs(a: bigint) {
  return a > 0 ? a : -a
}

export function max(a: bigint, b: bigint) {
  return a > b ? a : b
}

export function min(a: bigint, b: bigint) {
  return a > b ? b : a
}

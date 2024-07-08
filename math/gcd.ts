/**
 * // 计算最大公约数（GCD）
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export default function gcd(a: number, b: number) {
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}
/**
 * 
 * 将高位 i32 和低位 i32 转成 i64，（ number 最大安全整数为 pow(2, 53) - 1, 53 位） 
 * 
 * @param low 
 * @param high 
 * @returns 
 */

const UINT32_MAX = Math.pow(2, 32)

export default function i32Toi64(low: number, high: number) {
  return (low >>> 0) + high * UINT32_MAX
}

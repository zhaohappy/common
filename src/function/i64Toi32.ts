/**
 * 
 * 将 value 分成高 32 位和低 32 位
 * 
 * @returns 
 */

const UINT32_MAX = Math.pow(2, 32)

/**
 * 只能处理正数
 * 
 * @param value 
 * @returns 
 */
export default function i64Toi32(value: number) {
  const high = Math.floor(value / UINT32_MAX)
  const low = value >>> 0
  return [low, high]
}

/**
 * 获取数组中中间的值
 * 
 * @param arr 
 * @returns 
 */
export default function median(arr: number[]) {
  if (arr.length === 0) {
    return 0
  }

  const sortedArr = arr.slice().sort((a, b) => a - b)

  const middleIndex = Math.floor(sortedArr.length / 2)

  if (sortedArr.length % 2 === 1) {
    return sortedArr[middleIndex]
  }
  else {
    return (sortedArr[middleIndex - 1] + sortedArr[middleIndex]) / 2
  }
}

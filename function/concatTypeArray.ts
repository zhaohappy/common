/**
 * @file 合并 TypeArray
 */

import { TypeArray, TypeArrayConstructor } from '../types/type'

export default function concatTypeArray<T extends TypeArrayConstructor>(
  constructor: T,
  arrays: InstanceType<T>[]
): InstanceType<T> {

  if (!arrays.length) {
    return null
  }

  if (arrays.length === 1) {
    return arrays[0]
  }

  let totalLength: number = 0
  let array: TypeArray
  for (array of arrays) {
    totalLength += array.length
  }
  let result = new constructor(totalLength) as InstanceType<T>

  let offset = 0
  for (array of arrays) {
    result.set(array, offset)
    offset += array.length
  }
  return result
}

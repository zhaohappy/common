/**
 * @file 合并 TypeArray
 */

import type { TypeArray, TypeArrayConstructor } from '../types/type'

type ReplaceGeneric<T> = T extends Uint8Array<ArrayBuffer>
  ? Uint8Array<ArrayBufferLike>
  : T extends Int8Array<ArrayBuffer>
    ? Int8Array<ArrayBufferLike>
    : T extends Uint16Array<ArrayBuffer>
      ? Uint16Array<ArrayBufferLike>
      : T extends Int16Array<ArrayBuffer>
        ? Int16Array<ArrayBufferLike>
        : T extends Uint32Array<ArrayBuffer>
          ? Uint32Array<ArrayBufferLike>
          : T extends Int32Array<ArrayBuffer>
            ? Int32Array<ArrayBufferLike>
            : T extends Float32Array<ArrayBuffer>
              ? Float32Array<ArrayBufferLike>
              : T extends Float64Array<ArrayBuffer>
                ? Float64Array<ArrayBufferLike>
                : T

export default function concatTypeArray<T extends TypeArrayConstructor>(
  constructor: T,
  arrays: ReplaceGeneric<InstanceType<T>>[]
): ReplaceGeneric<InstanceType<T>> {

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
  let result = new constructor(totalLength) as ReplaceGeneric<InstanceType<T>>

  let offset = 0
  for (array of arrays) {
    result.set(array, offset)
    offset += array.length
  }
  return result
}

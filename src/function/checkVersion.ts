/**
 * @file 判断版本
 */

import toNumber from './toNumber'

/**
 * 判断给定版本是否符合条件
 * 
 * @param version 待检查版本
 * @param checkVersion 版本基准
 * @param equal 是否判等
 * 
 * @returns 是否符合条件
 */
export default function checkVersion(version: string, checkVersion: string, equal: boolean = false) {
  const checkVersionArr = checkVersion.split('.')
  const versionArr = version.split('.')
  for (let i = 0; i < versionArr.length; i++) {
    if (equal && i == (versionArr.length - 1) && toNumber(versionArr[i]) >= toNumber(checkVersionArr[i])) {
      return versionArr.length >= checkVersionArr.length
    }
    if (toNumber(versionArr[i]) > toNumber(checkVersionArr[i])) {
      return true
    }
    else if (toNumber(versionArr[i]) < toNumber(checkVersionArr[i])) {
      return false
    }

    if (i === checkVersionArr.length - 1 && i === versionArr.length - 1) {
      return equal
    }

    if (i === checkVersionArr.length - 1) {
      return true
    }
    else if (i === versionArr.length - 1) {
      return false
    }
  }
  return true
}

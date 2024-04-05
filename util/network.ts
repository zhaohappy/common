/**
 * @file 网络类型
 * @author zhaogaoxing
 */

let networkStr: string
let networkType: string

const ua = navigator.userAgent || ''
networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other'
networkStr = networkStr.toLowerCase().replace('nettype/', '')

const networkMap = {
  'ethernet': 'ethernet',
  'wifi': 'wifi',
  '5g': '5g',
  '4g': '4g',
  '3g': '3g',
  '3gnet': '3g',
  '2g': '2g',
  'slow-2g': '2g'
}

networkType = networkMap[networkStr]

if (!networkType) {
  let connection = (navigator as any).connection
    || (navigator as any).mozConnection
    || (navigator as any).webkitConnection
  // 有 NetworkInformation 使用判断
  if (connection) {
    // 先使用 type 判断
    networkType = networkMap[connection.type]
    if (!networkType) {
      // 在使用 effectiveType 判断
      networkType = networkMap[connection.effectiveType]
    }
  }
}

if (!networkType) {
  networkType = 'unknown'
}

export default {
  name: networkType
}

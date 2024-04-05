/**
 * @file 网络类型
 */

import gpu from './gpu'


const ua = (typeof navigator === 'object' && navigator.userAgent || '').toLocaleLowerCase()

let vendor: 'intel' | 'amd' | 'apple' | 'unknown' = 'unknown'
let renderer = ''

if (ua.indexOf('intel') > -1) {
  vendor = 'intel'
}
else if (ua.indexOf('amd') > -1) {
  vendor = 'amd'
}

if (gpu.vendor === 'apple' && gpu.renderer.indexOf('m1') > -1) {
  vendor = 'apple'
  renderer = 'm1'
}
if (gpu.vendor === 'apple' && gpu.renderer.indexOf('m2') > -1) {
  vendor = 'apple'
  renderer = 'm2'
}

export default {
  vendor,
  renderer,
  core: navigator.hardwareConcurrency
}

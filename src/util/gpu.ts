/**
 * @file 网络类型
 */

let vendor: 'intel' | 'amd' | 'nvidia' | 'apple' | 'unknown' = 'unknown'
let renderer: ''


if (typeof window === 'object' && window.document) {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  // @ts-ignore
  if (gl?.getExtension) {
    // @ts-ignore
    const extension = gl.getExtension('WEBGL_debug_renderer_info')
    if (extension) {
      // @ts-ignore
      let ven: string = (gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) || '').toLocaleLowerCase()
      // @ts-ignore
      renderer = (gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) || '').toLocaleLowerCase()
      if (ven) {
        if (ven.indexOf('apple') > -1) {
          vendor = 'apple'
        }
        else if (ven.indexOf('intel') > -1) {
          vendor = 'intel'
        }
        else if (ven.indexOf('amd') > -1) {
          vendor = 'amd'
        }
        else if (ven.indexOf('nvidia') > -1) {
          vendor = 'nvidia'
        }
      }
    }
  }
}

export default {
  vendor,
  renderer
}

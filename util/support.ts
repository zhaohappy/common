import browser from './browser'


function supportedFeatures() {

  let blob = typeof Blob === 'function'
  let wasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function'
  let fetchSupported = typeof fetch === 'function'
  let documentSupport = typeof document === 'object'

  let canvas = documentSupport && document.createElement('canvas')
  let webgl = canvas && !!canvas.getContext('webgl')
  let offscreenCanvas = typeof OffscreenCanvas === 'function'

  let worker = typeof Worker === 'function'

  let arrayBuffer = typeof ArrayBuffer === 'function'

  let atomics = typeof Atomics === 'object'

  let audioContext = typeof AudioContext === 'function' || typeof webkitAudioContext === 'function'
  let audioWorklet = typeof AudioWorklet === 'function'

  let videoDecoder = typeof VideoDecoder === 'function'

  let audioDecoder = typeof AudioDecoder === 'function'

  let shareArrayBuffer = typeof SharedArrayBuffer === 'function'

  let mse = typeof MediaSource == 'function' || typeof ManagedMediaSource === 'function'

  let proxy = typeof Proxy === 'function'

  let thread = worker && shareArrayBuffer && atomics && proxy

  // safari 低于 11 不支持
  if (browser.safari && !browser.checkVersion(browser.majorVersion, '11', true)) {
    wasm = false
  }

  // chrome 94 以上才支持 webcodec
  if (browser.chrome && !browser.checkVersion(browser.majorVersion, '94', true)) {
    videoDecoder = false
    audioDecoder = false
  }

  // safari 17 之前渲染 VideoFrame 有问题
  if (browser.safari && !browser.checkVersion(browser.majorVersion, '17', true)) {
    videoDecoder = false
  }

  let webgpu = typeof navigator === 'object' && typeof navigator.gpu === 'object'

  let workerMSE = typeof MediaSourceHandle === 'function'

  let webAssemblyGlobal = wasm && typeof WebAssembly.Global === 'function'

  return {
    browser,
    blob,
    wasm,
    fetch: fetchSupported,
    webgl,
    worker,
    mse,
    arrayBuffer,
    audioContext,
    audioWorklet,
    videoDecoder,
    audioDecoder,
    atomics,
    shareArrayBuffer,
    thread,
    webgpu,
    offscreenCanvas,
    workerMSE,
    webAssemblyGlobal,
    proxy,
    simd: browser.chrome && browser.checkVersion(browser.majorVersion, '91', true)
      || browser.firefox && browser.checkVersion(browser.majorVersion, '89', true)
      || browser.safari && browser.checkVersion(browser.version, '16.4', true),
    baseSupported: fetchSupported && wasm && webgl && audioContext && arrayBuffer && webAssemblyGlobal
  }
}

const support = supportedFeatures()

export default support

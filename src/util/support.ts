import isAudioWorklet from '../function/isAudioWorklet'
import isWorker from '../function/isWorker'
import browser from './browser'
import os from './os'

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

  let atomics = typeof Atomics === 'object' && Atomics[Symbol.toStringTag] === 'Atomics'

  let audioContext = typeof AudioContext === 'function' || typeof webkitAudioContext === 'function'
  let audioWorklet = typeof AudioWorklet === 'function'

  let videoDecoder = typeof VideoDecoder === 'function'
  let videoEncoder = typeof VideoEncoder === 'function'

  let audioDecoder = typeof AudioDecoder === 'function'
  let audioEncoder = typeof AudioEncoder === 'function'

  let shareArrayBuffer = typeof SharedArrayBuffer === 'function'

  let mse = typeof MediaSource == 'function' || typeof ManagedMediaSource === 'function'

  let proxy = typeof Proxy === 'function'

  let thread = (worker || isWorker() || isAudioWorklet()) && shareArrayBuffer && atomics && proxy

  let jspi = typeof WebAssembly.Suspending === 'function' && typeof WebAssembly.promising === 'function'

  // safari 低于 11 不支持
  if (browser.safari && !browser.checkVersion(browser.majorVersion, '11', true)
    || os.ios && !browser.checkVersion(os.version, '11', true)
  ) {
    wasm = false
  }

  // chrome 94 以上才支持 webcodec
  if (browser.chrome && !browser.checkVersion(browser.majorVersion, '94', true)) {
    videoDecoder = false
    audioDecoder = false
  }

  // safari 17 之前渲染 VideoFrame 有问题
  if (browser.safari && !browser.checkVersion(browser.majorVersion, '17', true)
    || os.ios && !browser.checkVersion(os.version, '17', true)
  ) {
    videoDecoder = false
  }

  let webgpu = typeof navigator === 'object' && typeof navigator.gpu === 'object'

  let workerMSE = typeof MediaSourceHandle === 'function'

  let webAssemblyGlobal = wasm && typeof WebAssembly.Global === 'function'
  let trackGenerator = typeof MediaStreamTrackGenerator === 'function'

  return {
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
    videoEncoder,
    audioDecoder,
    audioEncoder,
    atomics,
    shareArrayBuffer,
    thread,
    webgpu,
    offscreenCanvas,
    workerMSE,
    webAssemblyGlobal,
    jspi,
    proxy,
    simd: (browser.chrome || browser.newEdge) && browser.checkVersion(browser.majorVersion, '91', true)
      || browser.firefox && browser.checkVersion(browser.majorVersion, '89', true)
      || browser.safari && browser.checkVersion(browser.version, '16.4', true)
      || os.ios && browser.checkVersion(os.version, '16.4', true),
    wasmPlayerSupported: fetchSupported && wasm && webgl && audioContext && arrayBuffer && webAssemblyGlobal,
    wasmBaseSupported: wasm && webAssemblyGlobal && arrayBuffer,
    trackGenerator
  }
}

const support = supportedFeatures()

export default support

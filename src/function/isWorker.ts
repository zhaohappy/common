import isDef from './isDef'
import isAudioWorklet from './isAudioWorklet'

export default function isWorker() {
  return !(typeof window === 'object' && isDef(window.document)) && !isAudioWorklet()
}

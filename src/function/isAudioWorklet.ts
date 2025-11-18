export default function isAudioWorklet() {
  // @ts-ignore
  return typeof registerProcessor === 'function' && typeof sampleRate === 'number' && typeof currentFrame === 'number' && typeof currentTime === 'number'
}

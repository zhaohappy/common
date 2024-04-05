interface ManagedMediaSource extends EventTarget {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/activeSourceBuffers) */
  readonly activeSourceBuffers: SourceBufferList;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/duration) */
  duration: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceclose_event) */
  onsourceclose: ((this: MediaSource, ev: Event) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceended_event) */
  onsourceended: ((this: MediaSource, ev: Event) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceopen_event) */
  onsourceopen: ((this: MediaSource, ev: Event) => any) | null;
  onstartstreaming: ((this: MediaSource, ev: Event) => any) | null;
  onendstreaming: ((this: MediaSource, ev: Event) => any) | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/readyState) */
  readonly readyState: ReadyState;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/sourceBuffers) */
  readonly sourceBuffers: SourceBufferList;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/addSourceBuffer) */
  addSourceBuffer(type: string): SourceBuffer;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/clearLiveSeekableRange) */
  clearLiveSeekableRange(): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/endOfStream) */
  endOfStream(error?: EndOfStreamError): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/removeSourceBuffer) */
  removeSourceBuffer(sourceBuffer: SourceBuffer): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/setLiveSeekableRange) */
  setLiveSeekableRange(start: number, end: number): void;
  addEventListener<K extends keyof MediaSourceEventMap>(
    type: K,
    listener: (this: MediaSource,
      ev: MediaSourceEventMap[K]
    ) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof MediaSourceEventMap>(
    type: K,
    listener: (this: MediaSource, ev: MediaSourceEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare const ManagedMediaSource: {
  prototype: ManagedMediaSource
  new(): ManagedMediaSource
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/MediaSource/isTypeSupported_static) */
  isTypeSupported(type: string): boolean
}

declare const MediaSourceHandle: {
  prototype: Object
  new(): Object
}

declare const webkitAudioContext: {
  prototype: AudioContext
  new(contextOptions?: AudioContextOptions): AudioContext
}

interface Element {
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>
  msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>
}

interface Document {
  mozExitFullScreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
}

interface Blob {
  mozSlice?: (start?: number, end?: number, contentType?: string) => Blob
  webkitSlice?: (start?: number, end?: number, contentType?: string) => Blob
}

interface Window {
  DEBUG?: boolean
}

interface MediaSource {
  handle?: MediaSource
}

// interface Atomics {
//   waitAsync?: (typedArray: Int32Array, index: number, value: number, timeout?: number) => Promise<'ok' | 'not-equal' | 'timed-out'>
// }

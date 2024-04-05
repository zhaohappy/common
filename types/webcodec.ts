/**
 * @file WebCodec 的声明文件
 *
 */

type WebCodecBufferSource = ArrayBuffer | ArrayBufferView

interface Plane {
  length: number
  rows: number
  stride: number
  readInto: (buffer: WebCodecBufferSource) => void
}

enum AudioSampleFormat {
  'U8',
  'S16',
  'S24',
  'S32',
  'FLT',
  'U8P',
  'S16P',
  'S24P',
  'S32P',
  'FLTP',
};

declare interface AudioData {
  readonly duration: number
  readonly numberOfChannels: number
  readonly sampleRate: number
  readonly timestamp: number
  readonly numberOfFrames: number
  readonly format: string

  close(): void

  clone(): AudioData
  allocationSize(): number
  copyTo(destination: BufferSource, options: {
    planeIndex: number
    frameOffset?: number
    frameCount?: number
    format?: 'u8' | 's16' | 's32' | 'f32' | 'u8-planar' | 's16-planar' | 's32-planar' | 'f32-planar'
  }): void
}

/**
 * @deprecated use AudioData instead
 */
declare interface AudioFrame {
  timestamp: number
  buffer: AudioBuffer
  close(): void
}

declare const AudioFrame: {
  prototype: AudioFrame
  new(init: {
    timestamp: number
    buffer: AudioBuffer
  }): AudioFrame
}

declare interface EncodedAudioChunk {
  type: 'key' | 'delta'
  timestamp: number
  duration?: number
  byteLength: number
  copyTo(des: WebCodecBufferSource): void
}

declare const EncodedAudioChunk: {
  prototype: EncodedAudioChunk
  new(data: {
    type: 'key' | 'delta'
    timestamp: number
    data: WebCodecBufferSource
  }): EncodedAudioChunk
}

declare interface AudioDecoder {
  readonly state: CodecState

  readonly decodeQueueSize: number

  configure(config: {
    codec: string
    sampleRate: number
    numberOfChannels: number
    description?: WebCodecBufferSource
  }): void

  decode(chunk: EncodedAudioChunk): void

  flush(): Promise<void>

  reset(): void

  close(): void
}

declare const AudioDecoder: {
  prototype: AudioDecoder
  new(init: {
    output: (data: AudioFrame | AudioData) => void,
    error: (error: Error) => void
  }): AudioDecoder
}

interface Plane {
  length: number
  rows: number
  stride: number
  readInto: (buffer: WebCodecBufferSource) => void
}


declare interface AudioData {
  readonly duration: number
  readonly numberOfChannels: number
  readonly sampleRate: number
  readonly timestamp: number
  readonly numberOfFrames: number
  readonly format: string

  close(): void

  clone(): AudioData
  copyTo(destination: BufferSource, options: {
    planeIndex: number
    frameOffset?: number
    frameCount?: number
    format?: 'u8' | 's16' | 's32' | 'f32' | 'u8-planar' | 's16-planar' | 's32-planar' | 'f32-planar'
  }): void
}

declare interface EncodedAudioChunk {
  type: 'key' | 'delta'
  timestamp: number
  duration?: number
  byteLength: number
  data?: ArrayBuffer
  copyTo(destination: BufferSource): void
}

declare interface AudioEncoder {
  readonly state: CodecState

  readonly encodeQueueSize: number

  configure(config: {
    codec: string
    sampleRate: number
    numberOfChannels: number
    bitrate: number
  }): void

  encode(data: AudioFrame | AudioData): void

  flush(): Promise<void>

  reset(): void

  close(): void
}

declare const AudioEncoder: {
  prototype: AudioEncoder
  new(init: {
    output: (data: EncodedAudioChunk, metadata?: {
      decoderConfig?: {
        codec: string
        sampleRate: number
        numberOfChannels: number
        description?: WebCodecBufferSource
      }
    }) => void,
    error: (error: Error) => void
  }): AudioEncoder
}

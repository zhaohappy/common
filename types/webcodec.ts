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

declare type AudioDataFormat = 'u8' | 's16' | 's32' | 'f32' | 'u8-planar' | 's16-planar' | 's32-planar' | 'f32-planar'

declare interface AudioData {
  readonly duration: number
  readonly numberOfChannels: number
  readonly sampleRate: number
  readonly timestamp: number
  readonly numberOfFrames: number
  readonly format: AudioDataFormat

  close(): void

  clone(): AudioData
  allocationSize(): number
  copyTo(destination: BufferSource, options: {
    planeIndex: number
    frameOffset?: number
    frameCount?: number
    format?: AudioDataFormat
  }): void
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

declare interface AudioDecoderConfig {
  codec: string
  sampleRate: number
  numberOfChannels: number
  description?: AllowSharedBufferSource
}

declare interface AudioDecoderSupport {
  supported: boolean
  config: AudioDecoderConfig
}

declare const AudioDecoder: {
  prototype: AudioDecoder
  new(init: {
    output: (data: AudioData) => void,
    error: (error: Error) => void
  }): AudioDecoder

  isConfigSupported(config: AudioDecoderConfig): Promise<AudioDecoderSupport>
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
  readonly format: AudioDataFormat

  close(): void

  clone(): AudioData
  copyTo(destination: BufferSource, options: {
    planeIndex: number
    frameOffset?: number
    frameCount?: number
    format?: AudioDataFormat
  }): void
}

declare const AudioData: {
  prototype: AudioData
  new(init: {
    format: AudioDataFormat
    sampleRate: number
    numberOfFrames: number
    numberOfChannels: number
    timestamp: number
    data: ArrayBufferView
    transfer?: ArrayBuffer[]
  }): AudioData
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

  encode(data: AudioData): void

  flush(): Promise<void>

  reset(): void

  close(): void
}

declare interface AudioEncoderConfig {
  codec: string
  sampleRate: number
  numberOfChannels: number
  bitrate: number
  description?: AllowSharedBufferSource
}

declare interface AudioEncoderSupport {
  supported: boolean
  config: AudioDecoderConfig
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

  isConfigSupported(config: AudioEncoderConfig): Promise<AudioEncoderSupport>
}

/**
 * @file netstring 实现
 */

import { Data } from '../types/type'
import * as is from '../util/is'
import RingBuffer from '../io/RingBuffer'
import * as logger from '../util/logger'


export type NetStringPayload = {
  cmd?: number
  payload: Uint8Array
  serialized: Uint8Array
}

type Options = {
  enableCommand?: boolean
  onDecodeText: (instance: NetString, payload: NetStringPayload) => void
  bufferSize: number
} & Data

enum Token {
  COLON = 0x3a,
  COLON_CHAR = ':',
  COMMA = 0x2c,
  COMMA_CHAR = ',',
  SPACE = 0x20,
  SPACE_CHAR = ' '
}

export default class NetString {

  private ringBuffer: RingBuffer<Uint8Array>

  public options: Options

  constructor(options: Options) {
    this.options = options
    this.ringBuffer = new RingBuffer(options.bufferSize, Uint8Array)
  }

  private isDigit(number: number) {
    return number >= 0x30 && number <= 0x39
  }

  public static encode(payload: Uint8Array, cmd?: number) {
    const enableCommand = is.number(cmd) && cmd >= 0

    const leadingString = enableCommand
      ? `${payload.length + `${cmd}${Token.SPACE_CHAR}`.length}${Token.COLON_CHAR}${cmd}${Token.SPACE_CHAR}`
      : `${payload.length}${Token.COLON_CHAR}`

    const buffer = new Uint8Array(leadingString.length + payload.length + 1)

    let i: number
    for (i = 0; i < leadingString.length; i++) {
      buffer[i] = leadingString.charCodeAt(i)
    }
    buffer.set(payload, i)
    // ,
    buffer[i + payload.length] = Token.COMMA

    return buffer
  }

  public decode(buffer?: Uint8Array) {

    if (buffer) {
      this.ringBuffer.write(buffer)
    }

    let len = 0
    let i = 0
    let startPointer = this.ringBuffer.getCurrentPointer()

    if (this.ringBuffer.getLength() >= 3) {
      if (this.ringBuffer.getByteByIndex(0) === 0x30
        && this.isDigit(this.ringBuffer.getByteByIndex(1))
      ) {
        logger.fatal('find leading zeros!')
      }
      if (!this.isDigit(this.ringBuffer.getByteByIndex(0))) {
        logger.fatal('the netstring must start with a number')
      }
      while (this.ringBuffer.getLength() && this.isDigit(this.ringBuffer.getByteByIndex(0))) {
        if (i > 9) {
          logger.fatal('length is more than 9 digits')
        }
        len = len * 10 + (this.ringBuffer.readByte() - 0x30)
        i++
      }

      if (!this.ringBuffer.getLength()) {
        this.ringBuffer.back(i)
        return
      }

      if (this.ringBuffer.readByte() !== Token.COLON) {
        logger.fatal('miss the colon')
      }
      else {
        i++
      }

      if (len + 1 <= this.ringBuffer.getLength()) {

        let cmd = 0
        let payloadLen = len

        if (this.options.enableCommand) {

          while (this.ringBuffer.getLength() && this.isDigit(this.ringBuffer.getByteByIndex(0))) {
            cmd = cmd * 10 + (this.ringBuffer.readByte() - 0x30)
            payloadLen--
          }
          if (this.ringBuffer.readByte() !== Token.SPACE) {
            logger.fatal('miss the space')
          }
          else {
            payloadLen--
          }
        }


        if (this.ringBuffer.getByteByIndex(payloadLen) !== Token.COMMA) {
          logger.fatal('miss the comma')
        }

        const payload = this.ringBuffer.read(payloadLen)
        this.ringBuffer.skip(1)

        const serialized = this.ringBuffer.readByRange(startPointer, this.ringBuffer.getCurrentPointer())

        if (this.options.onDecodeText) {
          this.options.onDecodeText(this, {
            payload,
            serialized,
            cmd: this.options.enableCommand ? cmd : void 0
          })
        }
        this.decode()
      }
      else {
        this.ringBuffer.back(i)
      }
    }
  }

  public destroy() {
    this.ringBuffer = null
    this.options = null
  }
}

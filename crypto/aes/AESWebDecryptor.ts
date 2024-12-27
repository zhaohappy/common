import { AesMode } from './aes'

export default class AESSoftDecryptor {

  private subtle: SubtleCrypto

  private key: CryptoKey

  private mode: AesMode

  private keyBuffer: Uint8Array

  constructor(mode: AesMode = AesMode.CBC) {
    this.mode = mode
    this.subtle = crypto.subtle || (crypto as any).webkitSubtle
  }

  private getSubtleAlgoName() {
    switch (this.mode) {
      case AesMode.CBC:
        return 'AES-CBC'
      case AesMode.CTR:
        return 'AES-CTR'
    }
  }

  public async expandKey(key: ArrayBuffer) {
    let keyBuffer = new Uint8Array(key)

    if (this.keyBuffer) {
      let sameKey = true
      let offset = 0

      while (offset < keyBuffer.length && sameKey) {
        sameKey = keyBuffer[offset] === this.keyBuffer[offset]
        offset++
      }

      if (sameKey) {
        return
      }
    }

    this.keyBuffer = keyBuffer

    this.key = await this.subtle.importKey(
      'raw',
      key,
      {
        name: this.getSubtleAlgoName()
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  public async encryptPadding(padding: Uint8Array, iv: BufferSource) {
    return new Uint8Array(await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv,
      },
      this.key,
      padding
    ))
  }

  public async decrypt(input: Uint8Array, iv: ArrayBuffer) {
    switch (this.mode) {
      case AesMode.CBC:
        return this.subtle.decrypt(
          {
            name: 'AES-CBC',
            iv
          },
          this.key,
          input,
        )
      case AesMode.CTR:
        return this.subtle.decrypt(
          {
            name: 'AES-CTR',
            counter: iv,
            length: 64
          },
          this.key,
          input
        )
    }
  }

  static isSupport() {
    const subtle = crypto.subtle || (crypto as any).webkitSubtle
    return typeof subtle === 'object'
  }
}

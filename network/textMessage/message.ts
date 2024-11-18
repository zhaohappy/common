import IOReader from '../../io/IOReader'
import IOWriter from '../../io/IOWriter'
import * as object from '../../util/object'

export class TextMessageRequest {
  method: string
  uri: string
  protocol: string
  headers: Record<string, string>
  content: string

  constructor(method: string, uri: string, protocol: string, headers: Record<string, string> = {}, content: string = '') {
    this.method = method
    this.uri = uri
    this.protocol = protocol
    this.headers = headers
    this.content = content
  }

  public setHeader(key: string, value: string) {
    this.headers[key] = value
  }

  public encode() {
    let text = `${this.method} ${this.uri} ${this.protocol}\r\n`
    this.headers['Content-Length'] = this.content.length + ''
    object.each(this.headers, (value, key) => {
      if (value) {
        text += `${key}: ${value}\r\n`
      }
    })
    text += '\r\n'

    if (this.content) {
      text += this.content
    }
    return text
  }
}

export class TextMessageResponse {
  protocol: string
  statusCode: number
  statusText: string
  headers: Record<string, string>
  content: string

  constructor(protocol: string, statusCode: number, statusText: string, headers: Record<string, string>, content: string) {
    this.protocol = protocol
    this.statusCode = statusCode
    this.statusText = statusText
    this.headers = headers
    this.content = content
  }
}

export abstract class TextMessageSession {
  protected ioReader: IOReader

  protected ioWriter: IOWriter

  constructor(ioReader: IOReader, ioWriter: IOWriter) {
    this.ioReader = ioReader
    this.ioWriter = ioWriter
  }

  protected async readResponse() {
    let head = (await this.ioReader.readLine()).trim().split(' ')
    let context = ''
    let headers: Record<string, string> = {}
    while (true) {
      const line = (await this.ioReader.readLine()).trim()
      // 响应头结束
      if (!line) {
        break
      }
      const item = line.split(':')
      headers[item[0].trim()] = item[1].trim()
    }
    if (headers['Content-Length']) {
      context = await this.ioReader.readString(+headers['Content-Length'])
    }
    return new TextMessageResponse(head[0].trim(), +head[1].trim(), head[2].trim(), headers, context)
  }

  public async request(request: TextMessageRequest): Promise<TextMessageResponse> {
    this.ioWriter.reset()
    this.ioWriter.writeString(request.encode())
    this.ioWriter.flush()
    return this.readResponse()
  }

  public async notify(request: TextMessageRequest) {
    this.ioWriter.reset()
    this.ioWriter.writeString(request.encode())
    await this.ioWriter.flush()
  }
}

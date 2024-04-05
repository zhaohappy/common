
declare interface FileSystemWritableFileStream {
  write(data: ArrayBuffer | ArrayBufferView | Blob | WriteParams): Promise<any>

  seek(position: number): Promise<any>

  truncate(size: number): Promise<any>

  close(): Promise<any>
}

declare interface FileHandler {
  createWritable(options?: {
    keepExistingData?: boolean
  }): Promise<FileSystemWritableFileStream>
  getFile(): Promise<File>
}

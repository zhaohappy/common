export default function withResolvers<T>() {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((s, j) => {
    resolve = s
    reject = j
  })
  return { promise, resolve, reject }
}

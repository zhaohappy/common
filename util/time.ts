
export function hhColonDDColonSSDotMill2Int64(time: string) {
  time = time.trim()
  let list = time.split(':')

  let ts = 0n

  if (list.length === 3) {
    ts += BigInt(+(list.shift().trim())) * 3600000n
  }
  ts += BigInt(+(list.shift().trim())) * 60000n

  list = list.shift().trim().split('.')
  ts += BigInt(+(list.shift().trim())) * 1000n
  ts += BigInt(+(list.shift().trim()))

  return ts
}

export function hhColonDDColonSSCommaMill2Int64(time: string) {
  time = time.trim()
  let list = time.split(':')

  let ts = 0n

  if (list.length === 3) {
    ts += BigInt(+(list.shift().trim())) * 3600000n
  }
  ts += BigInt(+(list.shift().trim())) * 60000n

  list = list.shift().trim().split(',')
  ts += BigInt(+(list.shift().trim())) * 1000n
  ts += BigInt(+(list.shift().trim()))

  return ts
}
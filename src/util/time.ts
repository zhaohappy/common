
export function hhColonDDColonSSDotMill2Int64(time: string) {
  if (!time) {
    return -1n
  }

  time = time.trim()

  let list = time.split(':')

  let ts = 0n

  if (list.length === 3) {
    ts += BigInt(+(list.shift().trim())) * 3600000n
  }
  ts += BigInt(+(list.shift().trim())) * 60000n

  list = list.shift().trim().split('.')
  ts += BigInt(+(list.shift().trim())) * 1000n
  if (list.length) {
    let len = list[0].trim().length
    let mill = BigInt(+(list.shift().trim()))
    if (len === 1) {
      mill *= 100n
    }
    else if (len === 2) {
      mill *= 10n
    }
    ts += mill
  }

  return ts
}

export function hhColonDDColonSSCommaMill2Int64(time: string) {
  if (!time) {
    return -1n
  }

  time = time.trim()

  let list = time.split(':')

  let ts = 0n

  if (list.length === 3) {
    ts += BigInt(+(list.shift().trim())) * 3600000n
  }
  ts += BigInt(+(list.shift().trim())) * 60000n

  list = list.shift().trim().split(',')
  ts += BigInt(+(list.shift().trim())) * 1000n
  if (list.length) {
    let len = list[0].trim().length
    let mill = BigInt(+(list.shift().trim()))
    if (len === 1) {
      mill *= 100n
    }
    else if (len === 2) {
      mill *= 10n
    }
    ts += mill
  }

  return ts
}

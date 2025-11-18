
import * as is from '../util/is'

export default function getErrorMessage(error: any): string {
  if (is.string(error)) {
    return error
  }
  if (is.object(error)) {
    if (is.string(error.message)) {
      return error.message
    }
    else if (is.string(error.msg)) {
      return error.msg
    }
    else if (is.func(error.toString)) {
      return error.toString()
    }
  }
  return 'unknown'
}

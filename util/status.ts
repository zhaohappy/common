
import toString from '../function/toString'
import { EMPTY_FUNCTION, WINDOW } from './constant'

export const DEBUG = /common/.test(toString(EMPTY_FUNCTION)) && (!WINDOW || WINDOW.DEBUG !== false) || (WINDOW && WINDOW.DEBUG)

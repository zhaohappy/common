
import Sleep from '../timer/Sleep'
import * as object from '../util/object'
import * as is from '../util/is'

/**
 * @param params 
 * @returns
 */
function parseData(params: Object) {
  return object.param(params) || ''
}

function data2FormData(data: Object) {
  const formData = new FormData()
  if (data) {
    object.each<any>(data, (value, key) => {
      formData.append(encodeURIComponent(key), encodeURIComponent(value))
    })
  }
  return formData
}

function formatData(contentType: string, data: any) {
  if (contentType === 'application/x-www-form-urlencoded') {
    return parseData(data)
  }
  else if (contentType === 'multipart/form-data') {
    return data2FormData(data)
  }
  else {
    return JSON.stringify(data)
  }
}

/**
 * 发送 post 请求
 * 
 * @param path fetch 路径
 * @param data post 发送 data
 * @returns 返回数据
 */
export async function post(path: string, data: Object, contentType?: string, headers: Object = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    let count = 0
    async function _fetch() {
      count++
      try {
        const header = {
          'Accept': 'application/json',
          'Content-Type': contentType || 'application/json',
        }
        object.each(headers, (value, key) => {
          header[key] = value
        })

        let signal = null
        let controller = null
        if (typeof AbortController === 'function') {
          controller = new AbortController()
          signal = controller.signal
        }

        const response = await Promise.race([
          fetch(path, {
            body: formatData(contentType, data),
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: header,
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
            signal
          }),
          new Sleep(8)
        ])

        if (is.number(response)) {
          if (controller) {
            controller.abort()
          }
          throw new Error(`fetch ${path}, data: ${JSON.stringify(data)} timeout`)
        }
        else {
          resolve(response.json())
        }
      }
      catch (error) {
        if (count < 3) {
          await new Sleep(1)
          _fetch()
        }
        else {
          reject(error)
        }
      }
    }
    _fetch()
  })
}

/**
 * 发送 get 请求
 * 
 * @param path fetch 路径
 * @param data get 发送 data
 * @returns 返回数据
 */
export async function get(path: string, data: Object, contentType?: string, headers: Object = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    let count = 0
    async function _fetch() {
      count++
      try {
        const header = {
          'Accept': 'application/json',
          'Content-Type': contentType || 'application/json',
        }
        object.each(headers, (value, key) => {
          header[key] = value
        })

        let signal = null
        let controller = null
        if (typeof AbortController === 'function') {
          controller = new AbortController()
          signal = controller.signal
        }

        const response = await Promise.race([
          fetch(`${path}?${parseData(data)}`, {
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: header,
            method: 'GET',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer',
            signal
          }),
          new Sleep(8)
        ])

        if (is.number(response)) {
          if (controller) {
            controller.abort()
          }
          throw new Error(`fetch ${path}, data: ${JSON.stringify(data)} timeout`)
        }
        else {
          resolve(response.json())
        }
      }
      catch (error) {
        if (count < 3) {
          await new Sleep(1)
          _fetch()
        }
        else {
          reject(error)
        }
      }
    }
    _fetch()
  })
}

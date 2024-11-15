/**
 * @file browser
 */

import { each } from '../util/array'
import { Browser } from '../types/type'
import * as is from './is'
import checkVersion from '../function/checkVersion'
import os from './os'

export const enum BrowserType {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  DING_TALK = 'dingtalk',
  BAIDU_APP = 'baiduApp',
  BAIDU = 'baidu',
  UC = 'uc',
  QQ = 'qq',
  QQ_APP = 'qqApp',
  IE = 'ie',
  EDGE = 'edge',
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  OPERA = 'opera',
  SAFARI = 'safari',
  NEW_EDGE = 'newEdge'
}

function getMajorVersion(version: string) {
  if (!is.string(version)) {
    return ''
  }
  return version.split('.').shift() || ''
}

/**
 * UA 检测浏览器
 *
 * 返回结果如下：
 *
 * {
 *    name: 'ie',     // 判断多个浏览器时，便于用 name 去 switch
 *    ie: true,       // 判断某一个浏览器时，便于 if (ie) { ... }
 *    version: '8.0'  // 版本号，string 类型
 * }
 *
 */

// http://www.fynas.com/ua/search
const list = [
  [ BrowserType.ALIPAY, /alipay/ ],
  [ BrowserType.WECHAT, /micromessenger/ ],
  [ BrowserType.DING_TALK, /dingtalk[ \/]([\d_.]+)/ ],
  [ BrowserType.BAIDU_APP, /baiduboxapp/ ],
  [ BrowserType.BAIDU, /baidubrowser/ ],
  [ BrowserType.BAIDU, /bdbrowser/ ],
  [ BrowserType.UC, /ucbrowser/ ],
  [ BrowserType.UC, /ucweb/ ],
  [ BrowserType.QQ, /qqbrowser/ ],
  [ BrowserType.QQ_APP, /qq/ ],
  [ BrowserType.IE, /iemobile[ \/]([\d_.]+)/ ],
  // IE10- 所有版本都有的信息是 MSIE x.0
  [ BrowserType.IE, /msie[ \/]([\d_.]+)/ ],
  [ BrowserType.IE, /trident[ \/]([\d_.]+)/, 4 ],
  [ BrowserType.EDGE, /edge[ \/]([\d_.]+)/ ],
  [ BrowserType.NEW_EDGE, /edg[ \/]([\d_.]+)/ ],
  [ BrowserType.CHROME, /chrome[ \/]([\d_.]+)/ ],
  [ BrowserType.FIREFOX, /firefox[ \/]([\d_.]+)/ ],
  [ BrowserType.OPERA, /opera(?:.*version)?[ \/]([\d_.]+)/ ],
  [ BrowserType.SAFARI, /version[ \/]([\d_.]+) safari/ ],
  // 新版 Safari UA
  [ BrowserType.SAFARI, /version[ \/]([\d_.]+) \S* safari/ ],
  [ BrowserType.SAFARI, /safari/ ]
]

const getMajorVersionMap = {

}

const checkVersionMap = {

}

/**
 * 获取 UA 的结构化信息
 *
 * @inner
 * @param {string} ua
 * @return {Object}
 */
function parseUA(ua: string): Browser {

  let name: string
  let version: string

  each(
    list,
    (item) => {
      let match = (item[1] as RegExp).exec(ua)
      if (match) {
        name = item[0] as string
        version = match[1]
        if (version) {
          version = version.replace(/_/g, '.')
          if (item[2]) {
            version = (parseInt(version, 10) + (item[2] as number)) + '.0'
          }
        }
        return false
      }
    }
  )

  // safari 找不到版本号，直接使用 iOS 版本
  // 一般来说 safari 版本号 >= iOS 版本号
  if (name === BrowserType.SAFARI && !version) {
    version = os.version
  }

  return {
    name: name || '',
    version: version || '',
    majorVersion: (getMajorVersionMap[name] || getMajorVersion)(version),
    checkVersion: checkVersionMap[name] || checkVersion
  }

}

const browser = parseUA((typeof navigator === 'object' && navigator.userAgent || '').toLowerCase())
if (browser.name) {
  browser[browser.name] = true
}

export default browser

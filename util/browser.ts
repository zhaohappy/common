/**
 * @file browser
 */

import { each } from '../util/array'
import { Browser } from '../types/type'
import * as is from './is'
import checkVersion from '../function/checkVersion'

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

const iOSSafariWebkitVersionList = [
  ['603.2.1', '10.3'],
  ['604.2.4', '11'],
  ['606.1.36', '12'],
  ['608.2.11', '13'],
  ['610.1.28', '14'],
  ['612.1.27', '15'],
  ['612.2.9', '15.1'],
  ['612.3.6', '15.2'],
  ['612.4.9', '15.3'],
  ['613.1.17', '15.4'],
  ['613.2.7', '15.5'],
  ['613.3.9', '15.6'],
  ['614.1.25', '16'],
  ['614.2.9', '16.1'],
  ['614.3.7', '16.2'],
  ['614.4.6', '16.3'],
  ['615.1.26', '16.4'],
  ['615.2.9', '16.5'],
  ['615.3.12', '16.6'],
  ['616.1.27', '17'],
  ['616.2.9', '17.1'],
  ['617.1.17', '17.2'],
  ['617.2.4', '17.3'],
  ['618.1.15', '17.4'],
  ['618.2.12', '17.5'],
  ['618.3.11', '17.6'],
  ['619.1.26', '18'],
  ['619.2.8', '18.1'],
  ['620.1.11', '18.2']
]

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

  // safari 找不到版本号，根据 webkit 查找
  if (name === BrowserType.SAFARI && !version) {
    let match = /safari[ \/]([\d_.]+)/.exec(ua)
    if (match && match[1]) {
      const webkit = match[1]
      if (webkit) {
        for (let i = iOSSafariWebkitVersionList.length - 1; i >= 0; i--) {
          if (checkVersion(webkit, iOSSafariWebkitVersionList[i][0], true)) {
            version = iOSSafariWebkitVersionList[i][1]
            break
          }
        }
      }
      if (!version) {
        version = '1'
      }
    }
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

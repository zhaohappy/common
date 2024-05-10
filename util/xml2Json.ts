/**
 * from https://github.com/hendt/xml2json
 * MIT License
 * 
 * 修复属性之间没有空格无法解析的问题
 */

type Options = {
  aloneValueName?: string
}

const defaultOptions: Options = {
  aloneValueName: '_@attribute'
}

/**
* Main function. Clears the given xml and then starts the recursion
*/
export default function xml2json(xmlStr: string, options = defaultOptions) {
  const opt = {...defaultOptions, ...options} as Required<Options>
  xmlStr = cleanXML(xmlStr, opt.aloneValueName)
  return xml2jsonRecurse(xmlStr, opt)
}

/**
* Recursive function that creates a JSON object with a given XML string.
*
*/
function xml2jsonRecurse(xmlStr: string, options: Required<Options>) {
  const obj: any = {}
  let startTagMatch: RegExpMatchArray
  while ((startTagMatch = xmlStr.match(/<[^\/][^>]*>/))) {
    let openingTag = startTagMatch[0]
    let tagName = openingTag.substring(1, openingTag.length - 1)
    let indexClosingTag = xmlStr.indexOf(openingTag.replace('<', '</'))

    // account for case where additional information in the opening tag
    let closingTagMatch: RegExpMatchArray
    if (indexClosingTag == -1 && (closingTagMatch = openingTag.match(/[^<][\S+$]*/))) {
      tagName = closingTagMatch[0]
      indexClosingTag = xmlStr.indexOf('</' + tagName)
      if (indexClosingTag == -1) {
        indexClosingTag = xmlStr.indexOf('<\\/' + tagName)
      }
    }
    let innerSubstring = xmlStr.substring(openingTag.length, indexClosingTag)
    const tempVal = innerSubstring.match(/<[^\/][^>]*>/) ? xml2json(innerSubstring, options) : innerSubstring

    // account for array or obj
    if (obj[tagName] === undefined) {
      obj[tagName] = tempVal
    }
    else if (Array.isArray(obj[tagName])) {
      obj[tagName].push(tempVal)
    }
    else {
      obj[tagName] = [obj[tagName], tempVal]
    }
    xmlStr = xmlStr.substring(openingTag.length * 2 + 1 + innerSubstring.length)
  }
  return obj
}

/**
* Removes some characters that would break the recursive function.
*
*/
function cleanXML(xmlStr: string, aloneValueName: string) {
  // remove commented lines
  xmlStr = xmlStr.replace(/<!--[\s\S]*?-->/g, '')
  // replace special characters
  xmlStr = xmlStr.replace(/[\n\t\r]/g, '')
  // replace leading spaces and tabs between elements
  xmlStr = xmlStr.replace(/>[ \t]+</g, '><')
  // delete docType tags
  xmlStr = xmlStr.replace(/<\?[^>]*\?>/g, '')

  // replace self closing tags
  xmlStr = replaceSelfClosingTags(xmlStr)
  // replace the alone tags values
  xmlStr = replaceAloneValues(xmlStr, aloneValueName)
  // replace attributes
  xmlStr = replaceAttributes(xmlStr)

  return xmlStr
}

/**
* Replaces all the self closing tags with attributes with another tag containing its attribute as a property.
* The function works if the tag contains multiple attributes.
* Example : '<tagName attrName="attrValue" />' becomes
*           '<tagName><attrName>attrValue</attrName></tagName>'
*/
function replaceSelfClosingTags(xmlStr: string) {
  const selfClosingTags = xmlStr.match(/<[^/][^>]*\/>/g)
  if (!selfClosingTags) {
    return xmlStr
  }

  for (let i = 0; i < selfClosingTags.length; i++) {
    const oldTag = selfClosingTags[i]
    const match = oldTag.match(/[^<][\S+$]*/)
    if (match) {
      const tagName = match[0]
      const closingTag = '</' + tagName + '>'
      const newTag = extractAttributeValue(tagName, oldTag) + closingTag
      xmlStr = xmlStr.replace(oldTag, newTag)
    }
  }
  return xmlStr
}

/**
*  Replaces all the tags with attributes and a value with a new tag.
*
*  Example : '<tagName attrName="attrValue">tagValue</tagName>' becomes
*  '<tagName><attrName>attrValue</attrName><_@attribute>tagValue</_@attribute></tagName>'
*
*/
function replaceAloneValues(xmlStr: string, aloneValueName: string) {
  const tagsWithAttributesAndValue = xmlStr.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>([^<]+)/g)
  if (!tagsWithAttributesAndValue) {
    return xmlStr
  }
  for (let i = 0; i < tagsWithAttributesAndValue.length; i++) {
    const oldTag = tagsWithAttributesAndValue[i]
    const oldTagName = oldTag.substring(0, oldTag.indexOf('>') + 1)
    const oldTagValue = oldTag.substring(oldTag.indexOf('>') + 1)

    const newTag = oldTagName + '<' + aloneValueName + '>' + oldTagValue + '</' + aloneValueName + '>'

    xmlStr = xmlStr.replace(oldTag, newTag)
  }
  return xmlStr
}

function extractAttributeValue(tagName: string, oldTag: string) {
  let newTag = '<' + tagName + '>'
  const attrs = oldTag.match(/([^"'\s]+)\s*=\s*((?:"[^"]+")|(?:'[^']+'))/g)
  if (!attrs) {
    return newTag
  }

  for (let j = 0; j < attrs.length; j++) {
    const attr = attrs[j]
    const attrName = attr.substring(0, attr.indexOf('=')).trim()
    const quote = attr[attr.length - 1]
    const attrValue = attr.substring(attr.indexOf(quote) + 1, attr.lastIndexOf(quote))

    newTag += '<' + attrName + '>' + attrValue + '</' + attrName + '>'
  }
  return newTag
}

/**
* Replaces all the tags with attributes with another tag containing its attribute as a property.
* The function works if the tag contains multiple attributes.
*
* Example : '<tagName attrName="attrValue"></tagName>' becomes '<tagName><attrName>attrValue</attrName></tagName>'
*
*/
function replaceAttributes(xmlStr: string) {
  const tagsWithAttributes = xmlStr.match(/<[^\/><]\S+\s+[^<]+[=][^<]+>/g)
  if (!tagsWithAttributes) {
    return xmlStr
  }
  for (let i = 0; i < tagsWithAttributes.length; i++) {
    const oldTag = tagsWithAttributes[i]
    const match = oldTag.match(/[^<]\S*/)
    if (match) {
      const tagName = match[0]
      const newTag = extractAttributeValue(tagName, oldTag)
      xmlStr = xmlStr.replace(oldTag, newTag)
    }
  }

  return xmlStr
}

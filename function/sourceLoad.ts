/**
 * 将某个文件的代码变成字符串（Webpack 使用）
 */

import type { Data } from '../types/type'

const webpackBootstrapFunc = `
function webpackBootstrapFunc (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if(installedModules[moduleId])
    return installedModules[moduleId].exports;
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    if (!modules[moduleId]) {
      console.error('can not found module:', moduleId)
    }
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }
  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.i = function(value) { return value; };
  __webpack_require__.d = function(exports, definition, getter) {
    if (typeof definition === 'string') {
      if(!__webpack_require__.o(exports, definition)) {
        Object.defineProperty(exports, definition, {
          enumerable: true,
          get: getter
        });
      }
    }
    else {
      for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
        }
      }
    }
  };
  __webpack_require__.r = function(exports) {
    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };
  __webpack_require__.f = {};
  __webpack_require__.e = function(chunkId) {
    return Promise.all(Object.keys(__webpack_require__.f).reduce(function (promises, key) {
      __webpack_require__.f[key](chunkId, promises);
        return promises;
    	}, []));
	};
  __webpack_require__.u = function(chunkId) {
    return chunkId + "LIB_NAME";
  };
  __webpack_require__.n = function(module) {
    var getter = module && module.__esModule ?
      function getDefault() { return module['default']; } :
      function getModuleExports() { return module; };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };
  (function() {
    var installedChunks = {
      "main": 0
    };
    __webpack_require__.f.j = function(chunkId, promises) {
      var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
      if (installedChunkData !== 0) {
        if(installedChunkData) {
          promises.push(installedChunkData[2]);
        } else {
          if (true) {
            var promise = new Promise(function(resolve, reject){installedChunkData = installedChunks[chunkId] = [resolve, reject]});
            promises.push(installedChunkData[2] = promise);
            var url = __webpack_require__.p + __webpack_require__.u(chunkId);
            var error = new Error();
            var loadingEnded = function(event) {
              if(__webpack_require__.o(installedChunks, chunkId)) {
                installedChunkData = installedChunks[chunkId];
                if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
                if(installedChunkData) {
                  var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                  var realSrc = url;
                  error.message = "Loading chunk " + chunkId + " failed.\\n(" + errorType + ": " + realSrc + ")";
                  error.name = "ChunkLoadError";
                  error.type = errorType;
                  error.request = realSrc;
                  installedChunkData[1](error);
                }
              }
            };
            __webpack_require__.l(url, loadingEnded);
          }
        }
      }
    };
    var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
    var [chunkIds, moreModules, runtime] = data;
    var moduleId, chunkId, i = 0;
    if (chunkIds.some(function(id){return installedChunks[id] !== 0})) {
      for(moduleId in moreModules) {
        if(__webpack_require__.o(moreModules, moduleId)) {
          __webpack_require__.m[moduleId] = moreModules[moduleId];
        }
      }
      if(runtime) runtime(__webpack_require__);
    }
    if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
      for (;i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
          installedChunks[chunkId][0]();
        }
        installedChunks[chunkId] = 0;
      }
    }
    var self = typeof globalThis !== undefined ? globalThis : self
    var exportName = 'LIBRARY_EXPORT_NAME'
    var chunkLoadingGlobal = self["webpackChunk" + exportName] = self["webpackChunk" + exportName] || [];
    chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
  })();
  (function() {
    var inProgress = {};
    __webpack_require__.l = function(url, done) {
      if (inProgress[url]) { inProgress[url].push(done); return; }
        inProgress[url] = [done];
        var onComplete = function(event) {
          clearTimeout(timeout);
          var doneFns = inProgress[url];
          delete inProgress[url];
          doneFns && doneFns.forEach(function(fn){fn(event)});
        }
        var timeout = setTimeout(onComplete.bind(null, undefined, { type: "timeout" }), 120000);
      if (typeof importScripts === 'function') {
        try {
          importScripts(url);onComplete({type: "load"});
        }
        catch(e) {
          onComplete({type: "missing"});
        }
      }
      else {
        import(url).then(function() {
          onComplete({
            type: "load"
          });
        }, function (error) {
          onComplete({
            type: "missing"
          });
        })
      }
    };
  })();
  __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  __webpack_require__.p = "ROOT_URL";
  __webpack_require__.oe = function(err) { console.error(err); throw err; };
  var f = __webpack_require__(__webpack_require__.s = ENTRY_MODULE);
  return f;
}
`

const moduleNameReqExp = '[\\.|\\-|\\+|\\w|\/|@|!]+'
// additional chars when output.path info is true
const dependencyRegExp = '\\(\\s*(\/\\*.*?\\*\/)?\\s*.*?(' + moduleNameReqExp + ').*?\\)'

// http://stackoverflow.com/a/2593661/130442
function quoteRegExp(str: string) {
  return (str + '').replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&')
}

function isNumeric(n: any) {
  // 1 * n converts integers, integers as string ("123"), 1e3 and "1e3" to integers and strings to NaN
  return !isNaN(n)
}

function getModuleDependencies(sources: string, module: string, queueName: string, requiredModules: Data) {
  const retval = {}
  retval[queueName] = []

  let fnString = module.toString()
  const wrapperSignature = fnString.match(/^(function)?\s?\w*\(\w+,\s*(\w+),\s*(\w+)\)/)
  if (!wrapperSignature) {
    return retval
  }
  const webpackRequireName = wrapperSignature[3]

  if (!requiredModules.__webpack_exports_process__) {
    requiredModules.__webpack_require__ = webpackRequireName
    requiredModules.__webpack_exports__ = wrapperSignature[2]
    requiredModules.__webpack_exports_process__ = true
  }

  // main bundle deps
  let re = new RegExp('(\\\\n|\\W)' + quoteRegExp(webpackRequireName) + dependencyRegExp, 'g')
  let match: RegExpExecArray
  while ((match = re.exec(fnString))) {
    if (match[3] === 'dll-reference') {
      continue
    }
    retval[queueName].push(match[3])
  }

  // dll deps
  re = new RegExp('\\(' + quoteRegExp(webpackRequireName) + '\\("(dll-reference\\s(' + moduleNameReqExp + '))"\\)\\)' + dependencyRegExp, 'g')
  while ((match = re.exec(fnString))) {
    if (!sources[match[2]]) {
      retval[queueName].push(match[1])
      // @ts-ignore
      sources[match[2]] = __webpack_require__(match[1]).m
    }
    retval[match[2]] = retval[match[2]] || []
    retval[match[2]].push(match[4])
  }

  // convert 1e3 back to 1000 - this can be important after uglify-js converted 1000 to 1e3
  const keys = Object.keys(retval)
  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < retval[keys[i]].length; j++) {
      if (isNumeric(+retval[keys[i]][j])) {
        retval[keys[i]][j] = +retval[keys[i]][j]
      }
    }
  }

  return retval
}

function hasValuesInQueues(queues) {
  const keys = Object.keys(queues)
  return keys.reduce(function (hasValues, key) {
    return hasValues || queues[key].length > 0
  }, false)
}

function getRequiredModules(sources, moduleId) {
  const modulesQueue = {
    main: [moduleId]
  }
  const requiredModules = {
    main: [],
    __webpack_exports__: '__webpack_exports__',
    __webpack_require__: '__webpack_require__',
    __webpack_exports_process__: false
  }
  const seenModules = {
    main: {}
  }

  while (hasValuesInQueues(modulesQueue)) {
    const queues = Object.keys(modulesQueue)
    for (let i = 0; i < queues.length; i++) {
      let queueName = queues[i]
      let queue = modulesQueue[queueName]
      let moduleToCheck = queue.pop()
      seenModules[queueName] = seenModules[queueName] || {}
      if (seenModules[queueName][moduleToCheck] || !sources[queueName][moduleToCheck]) {
        continue
      }
      seenModules[queueName][moduleToCheck] = true
      requiredModules[queueName] = requiredModules[queueName] || []
      requiredModules[queueName].push(moduleToCheck)
      let newModules = getModuleDependencies(sources, sources[queueName][moduleToCheck], queueName, requiredModules)
      let newModulesKeys = Object.keys(newModules)
      for (let j = 0; j < newModulesKeys.length; j++) {
        modulesQueue[newModulesKeys[j]] = modulesQueue[newModulesKeys[j]] || []
        modulesQueue[newModulesKeys[j]] = modulesQueue[newModulesKeys[j]].concat(newModules[newModulesKeys[j]])
      }
    }
  }
  return requiredModules
}

export default function (moduleId: string, options: {
  varName: string
  exportName?: string
  pointName?: string
  exportIsClass?: boolean
}) {
  const sources = {
    // @ts-ignore
    main: __webpack_modules__
  }

  const requiredModules = getRequiredModules(sources, moduleId)

  let src = ''
  let stringifyModuleId = JSON.stringify(moduleId)

  return src + 'var ' + options.varName + '=(' + webpackBootstrapFunc.replace('ENTRY_MODULE', stringifyModuleId)
    // @ts-ignore
    .replace('ROOT_URL', __webpack_require__.p || '')
    // @ts-ignore
    .replace('LIBRARY_EXPORT_NAME', __LIBRARY_EXPORT_NAME__)
    // @ts-ignore
    .replace('LIB_NAME', __webpack_require__.u && __webpack_require__.u('') || '')
      + ')({' + requiredModules.main.map(function (id) {
    const stringifyId = JSON.stringify(id)
    let source = '' + stringifyId + ': ' + sources.main[id].toString()
    if (stringifyId === stringifyModuleId && options.exportName && options.pointName) {
      const line = `;${requiredModules.__webpack_require__}.d(
          ${requiredModules.__webpack_exports__},
          "${options.exportName}",
          function() {
            if (${options.exportIsClass}) {
              for (var key in ${requiredModules.__webpack_exports__}) {
                if (key === '${options.exportName}') {
                  continue;
                }
                var v = ${requiredModules.__webpack_exports__}[key];
                if (typeof v === 'function' && v.name === '${options.pointName}') {
                  return v;
                }
              }
            }
            return ${options.pointName};
          }
        );`
      source = source.slice(0, source.length - 1) + line + '}'
    }
    return source
  }).join(',') + '});'
}

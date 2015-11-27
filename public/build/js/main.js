(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});var ENV='dev';var isProd=true,apiVersion='v1',apiHost='http://banerelle.com/api',siteRoot='http://banerelle.com';switch(ENV){case 'dev':isProd = false;apiHost = 'http://localhost:8888/api';siteRoot = 'http://localhost:8888';break;}var Config=exports.Config = {ENV:ENV,api_root:apiHost + '/',site_root:siteRoot + '/'};

},{}],4:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _jquery=require('jquery');var _jquery2=_interopRequireDefault(_jquery);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Initialize=(function(){function Initialize(){_classCallCheck(this,Initialize);}_createClass(Initialize,null,[{key:'globals',value:function globals(){window.jQuery = _jquery2.default;}},{key:'bootstrap',value:function bootstrap(){require('bootstrap');}},{key:'jqueryReady',value:function jqueryReady(){(0,_jquery2.default)('a.btn-lg').on('click',function(){if(ga)ga('send','event','buttons','click','stay tuned');console.log('send','event','buttons','click','stay tuned');});}},{key:'onLoad',value:function onLoad(){Initialize.globals();Initialize.bootstrap();Initialize.jqueryReady();}}]);return Initialize;})();exports.default = Initialize;

},{"bootstrap":"bootstrap","jquery":"jquery"}],5:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _path=require('path');var _path2=_interopRequireDefault(_path);var _Utils=require('../Utils/Utils');var _Utils2=_interopRequireDefault(_Utils);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Routes=(function(){function Routes(){_classCallCheck(this,Routes);}_createClass(Routes,null,[{key:'current',value:function current(pathname){var basename=_path2.default.basename(pathname) || Routes.homeRoute;var camelName=basename.replace(/-([a-z])/g,function(g){return g[1].toUpperCase();});if(typeof Routes[camelName] === 'function'){Routes[camelName]();}}},{key:'home',value:function home(){console.log('Home route');}},{key:'rsvp',value:function rsvp(){console.log('rsvp');}}]);return Routes;})();Routes.homeRoute = 'home';exports.default = Routes;

},{"../Utils/Utils":6,"path":1,"react":"react","react-dom":"react-dom"}],6:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _Constants=require('./Constants');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Utils=(function(){function Utils(){_classCallCheck(this,Utils);}_createClass(Utils,null,[{key:'getJSONP',value:function getJSONP(url,callback){var ref=window.document.getElementsByTagName('script')[0];var script=window.document.createElement('script');script.src = url + (url.indexOf('?') + 1?'&':'?') + 'callback=' + callback;ref.parentNode.insertBefore(script,ref);script.onload = function(){this.remove();};}},{key:'quoteRegex',value:function quoteRegex(regex){return regex.replace(/([()[{*+.$^\\|?])/g,'\\$1');}},{key:'trimChar',value:function trimChar(str,chr){chr = Utils.quoteRegex(chr);return str.replace(new RegExp('^' + chr + '+|' + chr + '+$','g'),"");}},{key:'buildUrl',value:function buildUrl(endpoint){endpoint = Utils.trimChar(endpoint,'/');if(endpoint.indexOf(_Constants.Config.api_root) === -1){endpoint = _Constants.Config.api_root + endpoint;}return endpoint;}}]);return Utils;})();exports.default = Utils;

},{"./Constants":3}],7:[function(require,module,exports){
'use strict';var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _Initialize=require('./Utils/Initialize');var _Initialize2=_interopRequireDefault(_Initialize);var _Routes=require('./Utils/Routes');var _Routes2=_interopRequireDefault(_Routes);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}_Initialize2.default.onLoad();_Routes2.default.current(window.location.pathname);

},{"./Utils/Initialize":4,"./Utils/Routes":5,"react":"react","react-dom":"react-dom"}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Db25zdGFudHMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvSW5pdGlhbGl6ZS5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Sb3V0ZXMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvVXRpbHMuanMiLCJyZXNvdXJjZXMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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TSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIEVOViA9IChcbiAgICAnZGV2J1xuICAgIC8vJ3Byb2R1Y3Rpb24nXG4pO1xuXG52YXIgaXNQcm9kICAgICA9IHRydWUsXG4gICAgYXBpVmVyc2lvbiA9ICd2MScsXG4gICAgYXBpSG9zdCAgICA9ICdodHRwOi8vYmFuZXJlbGxlLmNvbS9hcGknLFxuICAgIHNpdGVSb290ICAgPSAnaHR0cDovL2JhbmVyZWxsZS5jb20nO1xuXG5zd2l0Y2ggKEVOVikge1xuICAgIGNhc2UgJ2Rldic6XG4gICAgICAgIGlzUHJvZCAgID0gZmFsc2U7XG4gICAgICAgIGFwaUhvc3QgID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9hcGknO1xuICAgICAgICBzaXRlUm9vdCA9ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnO1xuICAgICAgICBicmVhaztcbn1cblxuZXhwb3J0IHZhciBDb25maWcgPSB7XG4gIEVOVjogRU5WLFxuICBhcGlfcm9vdDogYXBpSG9zdCsnLycsXG4gIHNpdGVfcm9vdDogc2l0ZVJvb3QrJy8nXG59O1xuIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5pdGlhbGl6ZSB7XG5cbiAgc3RhdGljIGdsb2JhbHMoKSB7XG4gICAgLy8gRXhwb3NlIGdsb2JhbHMgbGlrZSBqUXVlcnlcbiAgICB3aW5kb3cualF1ZXJ5ID0gJDtcbiAgfVxuXG4gIHN0YXRpYyBib290c3RyYXAoKSB7XG4gICAgcmVxdWlyZSgnYm9vdHN0cmFwJyk7XG4gIH1cblxuICBzdGF0aWMganF1ZXJ5UmVhZHkoKSB7XG4gICAgLy8gQ2xpY2sgb24gYmlnIGJ1dHRvbjpcbiAgICAkKCdhLmJ0bi1sZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChnYSkgZ2EoJ3NlbmQnLCAnZXZlbnQnLCAnYnV0dG9ucycsICdjbGljaycsICdzdGF5IHR1bmVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZW5kJywgJ2V2ZW50JywgJ2J1dHRvbnMnLCAnY2xpY2snLCAnc3RheSB0dW5lZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG9uTG9hZCgpIHtcbiAgICBJbml0aWFsaXplLmdsb2JhbHMoKTtcbiAgICBJbml0aWFsaXplLmJvb3RzdHJhcCgpO1xuICAgIEluaXRpYWxpemUuanF1ZXJ5UmVhZHkoKTtcbiAgfVxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vVXRpbHMvVXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZXMge1xuXG4gIHN0YXRpYyBob21lUm91dGUgPSAnaG9tZSc7XG5cbiAgc3RhdGljIGN1cnJlbnQocGF0aG5hbWUpIHtcbiAgICB2YXIgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKHBhdGhuYW1lKSB8fCBSb3V0ZXMuaG9tZVJvdXRlO1xuICAgIHZhciBjYW1lbE5hbWUgPSBiYXNlbmFtZS5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbiAoZykgeyByZXR1cm4gZ1sxXS50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgICBpZiAodHlwZW9mIFJvdXRlc1tjYW1lbE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBSb3V0ZXNbY2FtZWxOYW1lXSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDdXN0b20gUm91dGVzOlxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzdGF0aWMgaG9tZSgpIHtcbiAgICBjb25zb2xlLmxvZygnSG9tZSByb3V0ZScpO1xuICAgIC8vIFJlYWN0RE9NLnJlbmRlcihcbiAgICAvLyAgIDxIZWxsb1dvcmxkIC8+LFxuICAgIC8vICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4YW1wbGUnKVxuICAgIC8vICk7XG4gIH1cblxuICBzdGF0aWMgcnN2cCgpIHtcbiAgICBjb25zb2xlLmxvZygncnN2cCcpO1xuICB9XG5cbn1cbiIsImltcG9ydCB7IENvbmZpZywgfSBmcm9tICcuL0NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWxzIHtcblxuICAvKipcbiAgICogR2V0IEpTT04gZGF0YSBmcm9tIGFub3RoZXIgc2VydmVyLiBTdXBwb3J0ZWQgYmFjayB0byBJRTYuXG4gICAqIGNyZWRpdDogaHR0cDovL2dvbWFrZXRoaW5ncy5jb20vZGl0Y2hpbmctanF1ZXJ5XG4gICAqIEBwYXJhbSB1cmxcbiAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAqL1xuICBzdGF0aWMgZ2V0SlNPTlAodXJsLCBjYWxsYmFjaykge1xuXG4gICAgLy8gQ3JlYXRlIHNjcmlwdCB3aXRoIHVybCBhbmQgY2FsbGJhY2sgKGlmIHNwZWNpZmllZClcbiAgICB2YXIgcmVmID0gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCAnc2NyaXB0JyApWyAwIF07XG4gICAgdmFyIHNjcmlwdCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2NyaXB0JyApO1xuICAgIHNjcmlwdC5zcmMgPSB1cmwgKyAodXJsLmluZGV4T2YoICc/JyApICsgMSA/ICcmJyA6ICc/JykgKyAnY2FsbGJhY2s9JyArIGNhbGxiYWNrO1xuXG4gICAgLy8gSW5zZXJ0IHNjcmlwdCB0YWcgaW50byB0aGUgRE9NIChhcHBlbmQgdG8gPGhlYWQ+KVxuICAgIHJlZi5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggc2NyaXB0LCByZWYgKTtcblxuICAgIC8vIEFmdGVyIHRoZSBzY3JpcHQgaXMgbG9hZGVkIChhbmQgZXhlY3V0ZWQpLCByZW1vdmUgaXRcbiAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICB9O1xuXG4gIH1cblxuICAvKipcbiAgICogUXVvdGVzIHRoZSBnaXZlbiBzdHJpbmcgc28gaXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIGEgUmVndWxhciBFeHByZXNzaW9uLlxuICAgKiBAcGFyYW0gcmVnZXhcbiAgICogQHJldHVybnMgeyp8c3RyaW5nfHZvaWR8WE1MfVxuICAgKi9cbiAgc3RhdGljIHF1b3RlUmVnZXgocmVnZXgpIHtcbiAgICAgIHJldHVybiByZWdleC5yZXBsYWNlKC8oWygpW3sqKy4kXlxcXFx8P10pL2csICdcXFxcJDEnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmltIHRoZSBnaXZlbiBjaGFyYWN0ZXIgZnJvbSBib3RoIGVuZHMgb2YgdGhlIGdpdmVuIHN0cmluZy5cbiAgICogQHBhcmFtIHN0clxuICAgKiBAcGFyYW0gY2hyXG4gICAqIEByZXR1cm5zIHsqfHN0cmluZ3x2b2lkfFhNTH1cbiAgICovXG4gIHN0YXRpYyB0cmltQ2hhcihzdHIsIGNocikge1xuICAgICAgY2hyID0gVXRpbHMucXVvdGVSZWdleChjaHIpO1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgY2hyICsgJyt8JyArIGNociArICcrJCcsICdnJyksIFwiXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBlbmRwb2ludFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGJ1aWxkVXJsKGVuZHBvaW50KSB7XG4gICAgICBlbmRwb2ludCA9IFV0aWxzLnRyaW1DaGFyKGVuZHBvaW50LCAnLycpO1xuXG4gICAgICBpZiAoZW5kcG9pbnQuaW5kZXhPZihDb25maWcuYXBpX3Jvb3QpID09PSAtMSkge1xuICAgICAgICAgIGVuZHBvaW50ID0gQ29uZmlnLmFwaV9yb290ICsgZW5kcG9pbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbmRwb2ludDtcbiAgfVxuXG59XG4iLCIvLyBtYWluLmpzXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgSW5pdGlhbGl6ZSBmcm9tICcuL1V0aWxzL0luaXRpYWxpemUnO1xuaW1wb3J0IFJvdXRlcyBmcm9tICcuL1V0aWxzL1JvdXRlcyc7XG5cbi8vIFJ1biB0aGF0IGluaXQ6XG5Jbml0aWFsaXplLm9uTG9hZCgpO1xuXG4vLyBJbml0aWFsaXplIGN1cnJlbnQgcm91dGVcblJvdXRlcy5jdXJyZW50KHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7Il19

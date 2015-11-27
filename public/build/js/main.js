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
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var $=require('jquery');var Initialize=(function(){function Initialize(){_classCallCheck(this,Initialize);}_createClass(Initialize,null,[{key:'globals',value:function globals(){window.jQuery = $;}},{key:'bootstrap',value:function bootstrap(){require('bootstrap');}},{key:'onReady',value:function onReady(){document.getElementById('btnComingSoon').onclick = function(){if(ga)ga('send','event','buttons','click','stay tuned');console.log('send','event','buttons','click','stay tuned');return false;};}},{key:'onLoad',value:function onLoad(){Initialize.globals();Initialize.bootstrap();Initialize.onReady();}}]);return Initialize;})();exports.default = Initialize;

},{"bootstrap":"bootstrap","jquery":"jquery"}],5:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _path=require('path');var _path2=_interopRequireDefault(_path);var _Utils=require('../Utils/Utils');var _Utils2=_interopRequireDefault(_Utils);var _RsvpForm=require('../Views/RsvpForm');var _RsvpForm2=_interopRequireDefault(_RsvpForm);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Routes=(function(){function Routes(){_classCallCheck(this,Routes);}_createClass(Routes,null,[{key:'current',value:function current(pathname){var basename=_path2.default.basename(pathname) || Routes.homeRoute;var camelName=basename.replace(/-([a-z])/g,function(g){return g[1].toUpperCase();});if(typeof Routes[camelName] === 'function'){Routes[camelName]();}}},{key:'home',value:function home(){console.log('Home route');}},{key:'rsvp',value:function rsvp(){console.log('rsvp');_reactDom2.default.render(_react2.default.createElement(_RsvpForm2.default,null),document.getElementById('RsvpForm'));}}]);return Routes;})();Routes.homeRoute = 'home';exports.default = Routes;

},{"../Utils/Utils":6,"../Views/RsvpForm":7,"path":1,"react":"react","react-dom":"react-dom"}],6:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _Constants=require('./Constants');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Utils=(function(){function Utils(){_classCallCheck(this,Utils);}_createClass(Utils,null,[{key:'getJSONP',value:function getJSONP(url,callback){var ref=window.document.getElementsByTagName('script')[0];var script=window.document.createElement('script');script.src = url + (url.indexOf('?') + 1?'&':'?') + 'callback=' + callback;ref.parentNode.insertBefore(script,ref);script.onload = function(){this.remove();};}},{key:'quoteRegex',value:function quoteRegex(regex){return regex.replace(/([()[{*+.$^\\|?])/g,'\\$1');}},{key:'trimChar',value:function trimChar(str,chr){chr = Utils.quoteRegex(chr);return str.replace(new RegExp('^' + chr + '+|' + chr + '+$','g'),"");}},{key:'buildUrl',value:function buildUrl(endpoint){endpoint = Utils.trimChar(endpoint,'/');if(endpoint.indexOf(_Constants.Config.api_root) === -1){endpoint = _Constants.Config.api_root + endpoint;}return endpoint;}}]);return Utils;})();exports.default = Utils;

},{"./Constants":3}],7:[function(require,module,exports){
"use strict";var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass !== "function" && superClass !== null){throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var RsvpForm=(function(_React$Component){_inherits(RsvpForm,_React$Component);function RsvpForm(props){_classCallCheck(this,RsvpForm);var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(RsvpForm).call(this,props));_this.state = {};_this.onYes = _this.onYes.bind(_this);_this.onNope = _this.onNope.bind(_this);return _this;}_createClass(RsvpForm,[{key:"render",value:function render(){return _react2.default.createElement("div",{className:"row"},_react2.default.createElement("h1",null,"RSVP ",_react2.default.createElement("small",null,"Banerelle Wedding")),_react2.default.createElement("p",{className:"lead"},"We'd love for you to join us. Start by finding your name:"),_react2.default.createElement("form",{className:"",role:"form"},_react2.default.createElement("div",{className:"form-group has-success has-feedback"},_react2.default.createElement("input",{id:"inputLastName",className:"form-control input-lg",type:"text",placeholder:"Last name"}),_react2.default.createElement("span",{className:"glyphicon glyphicon-ok form-control-feedback","aria-hidden":"true"})),_react2.default.createElement("blockquote",null,_react2.default.createElement("p",null,"Pick Your Eats")),_react2.default.createElement("div",{className:"form-group"},_react2.default.createElement("div",{className:"radio"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"radio",name:"foodOptions",id:"foodOptions1",value:"Burrito"}),"Breakfast Burrito")),_react2.default.createElement("div",{className:"radio"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"radio",name:"foodOptions",id:"foodOptions2",value:"McMuffin"}),"Egg McMuffin"))),_react2.default.createElement("blockquote",null,_react2.default.createElement("p",null,"Guest")),_react2.default.createElement("div",{className:"form-group"},_react2.default.createElement("div",{className:"checkbox disabled"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"checkbox",value:"+1",disabled:true}),"+1"))),_react2.default.createElement("button",{type:"submit",className:"btn btn-success",onClick:this.onYes},"YES"),_react2.default.createElement("button",{type:"button",className:"btn btn-danger",onClick:this.onNope},"Nope")));}},{key:"onYes",value:function onYes(e){e.preventDefault();console.log('onYes');}},{key:"onNope",value:function onNope(e){e.preventDefault();console.log('nope');}}]);return RsvpForm;})(_react2.default.Component);RsvpForm.propTypes = {};RsvpForm.defaultProps = {};exports.default = RsvpForm;

},{"react":"react"}],8:[function(require,module,exports){
'use strict';var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _Initialize=require('./Utils/Initialize');var _Initialize2=_interopRequireDefault(_Initialize);var _Routes=require('./Utils/Routes');var _Routes2=_interopRequireDefault(_Routes);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}_Initialize2.default.onLoad();_Routes2.default.current(window.location.pathname);

},{"./Utils/Initialize":4,"./Utils/Routes":5,"react":"react","react-dom":"react-dom"}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Db25zdGFudHMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvSW5pdGlhbGl6ZS5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Sb3V0ZXMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvVXRpbHMuanMiLCJyZXNvdXJjZXMvanMvVmlld3MvUnN2cEZvcm0uanMiLCJyZXNvdXJjZXMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7c0VDM0ZBLElBQUksR0FBRyxDQUNILEtBQUssQUFFUixDQUFDLEFBRUYsSUFBSSxNQUFNLENBQU8sSUFBSSxDQUNqQixVQUFVLENBQUcsSUFBSSxDQUNqQixPQUFPLENBQU0sMEJBQTBCLENBQ3ZDLFFBQVEsQ0FBSyxzQkFBc0IsQ0FBQyxBQUV4QyxPQUFRLEdBQUcsRUFDUCxLQUFLLEtBQUssQ0FDTixNQUFNLEdBQUssS0FBSyxDQUFDLEFBQ2pCLE9BQU8sR0FBSSwyQkFBMkIsQ0FBQyxBQUN2QyxRQUFRLEdBQUcsdUJBQXVCLENBQUMsQUFDbkMsTUFBTSxDQUNiLEFBRU0sSUFBSSxNQUFNLFNBQU4sTUFBTSxHQUFHLENBQ2xCLEdBQUcsQ0FBRSxHQUFHLENBQ1IsUUFBUSxDQUFFLE9BQU8sR0FBQyxHQUFHLENBQ3JCLFNBQVMsQ0FBRSxRQUFRLEdBQUMsR0FBRyxDQUN4QixDQUFDOzs7bXVCQ3RCRixJQUFJLENBQUMsQ0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFFTCxVQUFVLHNCQUFWLFVBQVUsd0JBQVYsVUFBVSxnQkFBVixVQUFVLDhDQUVaLENBRWYsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FDbkIsNkNBRWtCLENBQ2pCLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUN0Qix5Q0FFZ0IsQ0FHZixRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQzNELEdBQUksRUFBRSxDQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFFLFNBQVMsQ0FBRSxPQUFPLENBQUUsWUFBWSxDQUFDLENBQUMsQUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFFLFNBQVMsQ0FBRSxPQUFPLENBQUUsWUFBWSxDQUFDLENBQUMsQUFDL0QsT0FBTyxLQUFLLENBQUMsQ0FDZCxDQUFDLENBQ0gsdUNBRWUsQ0FDZCxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQUFDckIsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLEFBQ3ZCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUN0QixXQXpCa0IsVUFBVSx3QkFBVixVQUFVOzs7c3NDQ0lWLE1BQU0sc0JBQU4sTUFBTSx3QkFBTixNQUFNLGdCQUFOLE1BQU0sNkNBSVYsUUFBUSxDQUFFLENBQ3ZCLElBQUksUUFBUSxDQUFHLGVBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQUFDM0QsSUFBSSxTQUFTLENBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUUsU0FBVSxDQUFDLENBQUUsQ0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxBQUMzRixHQUFJLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFVBQVUsQ0FBRSxDQUMzQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUNyQixDQUNGLG1DQU1hLENBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUMzQixtQ0FFYSxDQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQUFDcEIsbUJBQVMsTUFBTSxDQUNiLHNEQUFZLENBQ1osUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FDcEMsQ0FBQyxDQUNILFdBMUJrQixNQUFNLE1BQU4sTUFBTSxDQUVsQixTQUFTLEdBQUcsTUFBTSxtQkFGTixNQUFNOzs7NndCQ0pOLEtBQUssc0JBQUwsS0FBSyx3QkFBTCxLQUFLLGdCQUFMLEtBQUssK0NBUVIsR0FBRyxDQUFFLFFBQVEsQ0FBRSxDQUc3QixJQUFJLEdBQUcsQ0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFFLFFBQVEsQ0FBRSxDQUFFLENBQUMsQ0FBRSxDQUFDLEFBQ2hFLElBQUksTUFBTSxDQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFFLFFBQVEsQ0FBRSxDQUFDLEFBQ3ZELE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUUsR0FBRyxDQUFFLEdBQUcsQ0FBQyxDQUFHLEdBQUcsQ0FBRyxHQUFHLENBQUEsQUFBQyxHQUFHLFdBQVcsR0FBRyxRQUFRLENBQUMsQUFHakYsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUUsTUFBTSxDQUFFLEdBQUcsQ0FBRSxDQUFDLEFBRzNDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBWSxDQUMxQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FDZixDQUFDLENBRUgsOENBT2lCLEtBQUssQ0FBRSxDQUNyQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUUsTUFBTSxDQUFDLENBQUMsQ0FDdEQsMENBUWUsR0FBRyxDQUFFLEdBQUcsQ0FBRSxDQUN0QixHQUFHLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxBQUM1QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBRSxHQUFHLENBQUMsQ0FBRSxFQUFFLENBQUMsQ0FBQyxDQUMxRSwwQ0FNZSxRQUFRLENBQUUsQ0FDdEIsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFFLEdBQUcsQ0FBQyxDQUFDLEFBRXpDLEdBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQXREbEIsTUFBTSxDQXNEbUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FDMUMsUUFBUSxHQUFHLFdBdkRaLE1BQU0sQ0F1RGEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUN6QyxBQUVELE9BQU8sUUFBUSxDQUFDLENBQ25CLFdBekRrQixLQUFLLHdCQUFMLEtBQUs7OztzakRDQUwsUUFBUSx1Q0FBUixRQUFRLG1CQUkzQixTQUptQixRQUFRLENBSWYsS0FBSyxDQUFFLHNCQUpBLFFBQVEsa0VBQVIsUUFBUSxZQUtuQixLQUFLLEdBRVgsTUFBSyxLQUFLLEdBQUcsRUFBRSxDQUFDLEFBRWhCLE1BQUssS0FBSyxHQUFHLE1BQUssS0FBSyxDQUFDLElBQUksT0FBTSxDQUFDLEFBQ25DLE1BQUssTUFBTSxHQUFHLE1BQUssTUFBTSxDQUFDLElBQUksT0FBTSxDQUFDLGNBQ3RDLGFBWGtCLFFBQVEsdUNBYWxCLENBR1AsT0FDRSxxQ0FBSyxTQUFTLENBQUMsS0FBSyxFQUNoQixnREFBUywrREFBZ0MsQ0FBSyxDQUM5QyxtQ0FBRyxTQUFTLENBQUMsTUFBTSw4REFBOEQsQ0FDakYsc0NBQU0sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUMxQixxQ0FBSyxTQUFTLENBQUMscUNBQXFDLEVBQ2hELHVDQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRyxDQUNsRyxzQ0FBTSxTQUFTLENBQUMsOENBQThDLENBQUMsY0FBWSxNQUFNLEVBQVEsQ0FDdkYsQ0FDTixnREFDSSx3REFBcUIsQ0FDWixDQUNiLHFDQUFLLFNBQVMsQ0FBQyxZQUFZLEVBQ3ZCLHFDQUFLLFNBQVMsQ0FBQyxPQUFPLEVBQ2xCLDJDQUNJLHVDQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUcscUJBRXZFLENBQ04sQ0FDTixxQ0FBSyxTQUFTLENBQUMsT0FBTyxFQUNsQiwyQ0FDSSx1Q0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFHLGdCQUV4RSxDQUNOLENBQ0osQ0FDTixnREFDSSwrQ0FBWSxDQUNILENBQ2IscUNBQUssU0FBUyxDQUFDLFlBQVksRUFDdkIscUNBQUssU0FBUyxDQUFDLG1CQUFtQixFQUM5QiwyQ0FDSSx1Q0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFBLEVBQUcsTUFFekMsQ0FDTixDQUNKLENBQ04sd0NBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxLQUFLLEFBQUMsUUFBYSxDQUNuRix3Q0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQyxTQUFjLENBQ2pGLENBQ0wsQ0FDTixDQUNILG9DQUVLLENBQUMsQ0FBRSxDQUNQLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxBQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQ3RCLHNDQUVNLENBQUMsQ0FBRSxDQUNSLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxBQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ3JCLFdBcEVrQixRQUFRLElBQVMsZ0JBQU0sU0FBUyxFQUFoQyxRQUFRLENBQ3BCLFNBQVMsR0FBRyxFQUFFLENBREYsUUFBUSxDQUVwQixZQUFZLEdBQUcsRUFBRSxtQkFGTCxRQUFROzs7bWJDSzdCLHFCQUFXLE1BQU0sRUFBRSxDQUFDLEFBR3BCLGlCQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgRU5WID0gKFxuICAgICdkZXYnXG4gICAgLy8ncHJvZHVjdGlvbidcbik7XG5cbnZhciBpc1Byb2QgICAgID0gdHJ1ZSxcbiAgICBhcGlWZXJzaW9uID0gJ3YxJyxcbiAgICBhcGlIb3N0ICAgID0gJ2h0dHA6Ly9iYW5lcmVsbGUuY29tL2FwaScsXG4gICAgc2l0ZVJvb3QgICA9ICdodHRwOi8vYmFuZXJlbGxlLmNvbSc7XG5cbnN3aXRjaCAoRU5WKSB7XG4gICAgY2FzZSAnZGV2JzpcbiAgICAgICAgaXNQcm9kICAgPSBmYWxzZTtcbiAgICAgICAgYXBpSG9zdCAgPSAnaHR0cDovL2xvY2FsaG9zdDo4ODg4L2FwaSc7XG4gICAgICAgIHNpdGVSb290ID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCc7XG4gICAgICAgIGJyZWFrO1xufVxuXG5leHBvcnQgdmFyIENvbmZpZyA9IHtcbiAgRU5WOiBFTlYsXG4gIGFwaV9yb290OiBhcGlIb3N0KycvJyxcbiAgc2l0ZV9yb290OiBzaXRlUm9vdCsnLydcbn07XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbml0aWFsaXplIHtcblxuICBzdGF0aWMgZ2xvYmFscygpIHtcbiAgICAvLyBFeHBvc2UgZ2xvYmFscyBsaWtlIGpRdWVyeVxuICAgIHdpbmRvdy5qUXVlcnkgPSAkO1xuICB9XG5cbiAgc3RhdGljIGJvb3RzdHJhcCgpIHtcbiAgICByZXF1aXJlKCdib290c3RyYXAnKTtcbiAgfVxuXG4gIHN0YXRpYyBvblJlYWR5KCkge1xuXG4gICAgLy8gQ2xpY2sgb24gYmlnIGJ1dHRvbjpcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29taW5nU29vbicpLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuICAgICAgaWYgKGdhKSBnYSgnc2VuZCcsICdldmVudCcsICdidXR0b25zJywgJ2NsaWNrJywgJ3N0YXkgdHVuZWQnKTtcbiAgICAgIGNvbnNvbGUubG9nKCdzZW5kJywgJ2V2ZW50JywgJ2J1dHRvbnMnLCAnY2xpY2snLCAnc3RheSB0dW5lZCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gIH1cblxuICBzdGF0aWMgb25Mb2FkKCkge1xuICAgIEluaXRpYWxpemUuZ2xvYmFscygpO1xuICAgIEluaXRpYWxpemUuYm9vdHN0cmFwKCk7XG4gICAgSW5pdGlhbGl6ZS5vblJlYWR5KCk7XG4gIH1cbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uL1V0aWxzL1V0aWxzJztcbmltcG9ydCBSc3ZwRm9ybSBmcm9tICcuLi9WaWV3cy9Sc3ZwRm9ybSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdXRlcyB7XG5cbiAgc3RhdGljIGhvbWVSb3V0ZSA9ICdob21lJztcblxuICBzdGF0aWMgY3VycmVudChwYXRobmFtZSkge1xuICAgIHZhciBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUocGF0aG5hbWUpIHx8IFJvdXRlcy5ob21lUm91dGU7XG4gICAgdmFyIGNhbWVsTmFtZSA9IGJhc2VuYW1lLnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uIChnKSB7IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKCk7IH0pO1xuICAgIGlmICh0eXBlb2YgUm91dGVzW2NhbWVsTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIFJvdXRlc1tjYW1lbE5hbWVdKCk7XG4gICAgfVxuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbSBSb3V0ZXM6XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHN0YXRpYyBob21lKCkge1xuICAgIGNvbnNvbGUubG9nKCdIb21lIHJvdXRlJyk7XG4gIH1cblxuICBzdGF0aWMgcnN2cCgpIHtcbiAgICBjb25zb2xlLmxvZygncnN2cCcpO1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxSc3ZwRm9ybSAvPixcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSc3ZwRm9ybScpXG4gICAgKTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBDb25maWcsIH0gZnJvbSAnLi9Db25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlscyB7XG5cbiAgLyoqXG4gICAqIEdldCBKU09OIGRhdGEgZnJvbSBhbm90aGVyIHNlcnZlci4gU3VwcG9ydGVkIGJhY2sgdG8gSUU2LlxuICAgKiBjcmVkaXQ6IGh0dHA6Ly9nb21ha2V0aGluZ3MuY29tL2RpdGNoaW5nLWpxdWVyeVxuICAgKiBAcGFyYW0gdXJsXG4gICAqIEBwYXJhbSBjYWxsYmFja1xuICAgKi9cbiAgc3RhdGljIGdldEpTT05QKHVybCwgY2FsbGJhY2spIHtcblxuICAgIC8vIENyZWF0ZSBzY3JpcHQgd2l0aCB1cmwgYW5kIGNhbGxiYWNrIChpZiBzcGVjaWZpZWQpXG4gICAgdmFyIHJlZiA9IHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ3NjcmlwdCcgKVsgMCBdO1xuICAgIHZhciBzY3JpcHQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NjcmlwdCcgKTtcbiAgICBzY3JpcHQuc3JjID0gdXJsICsgKHVybC5pbmRleE9mKCAnPycgKSArIDEgPyAnJicgOiAnPycpICsgJ2NhbGxiYWNrPScgKyBjYWxsYmFjaztcblxuICAgIC8vIEluc2VydCBzY3JpcHQgdGFnIGludG8gdGhlIERPTSAoYXBwZW5kIHRvIDxoZWFkPilcbiAgICByZWYucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIHNjcmlwdCwgcmVmICk7XG5cbiAgICAvLyBBZnRlciB0aGUgc2NyaXB0IGlzIGxvYWRlZCAoYW5kIGV4ZWN1dGVkKSwgcmVtb3ZlIGl0XG4gICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFF1b3RlcyB0aGUgZ2l2ZW4gc3RyaW5nIHNvIGl0IGNhbiBzYWZlbHkgYmUgdXNlZCBpbiBhIFJlZ3VsYXIgRXhwcmVzc2lvbi5cbiAgICogQHBhcmFtIHJlZ2V4XG4gICAqIEByZXR1cm5zIHsqfHN0cmluZ3x2b2lkfFhNTH1cbiAgICovXG4gIHN0YXRpYyBxdW90ZVJlZ2V4KHJlZ2V4KSB7XG4gICAgICByZXR1cm4gcmVnZXgucmVwbGFjZSgvKFsoKVt7KisuJF5cXFxcfD9dKS9nLCAnXFxcXCQxJyk7XG4gIH1cblxuICAvKipcbiAgICogVHJpbSB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGZyb20gYm90aCBlbmRzIG9mIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAqIEBwYXJhbSBzdHJcbiAgICogQHBhcmFtIGNoclxuICAgKiBAcmV0dXJucyB7KnxzdHJpbmd8dm9pZHxYTUx9XG4gICAqL1xuICBzdGF0aWMgdHJpbUNoYXIoc3RyLCBjaHIpIHtcbiAgICAgIGNociA9IFV0aWxzLnF1b3RlUmVnZXgoY2hyKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIGNociArICcrfCcgKyBjaHIgKyAnKyQnLCAnZycpLCBcIlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZW5kcG9pbnRcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBidWlsZFVybChlbmRwb2ludCkge1xuICAgICAgZW5kcG9pbnQgPSBVdGlscy50cmltQ2hhcihlbmRwb2ludCwgJy8nKTtcblxuICAgICAgaWYgKGVuZHBvaW50LmluZGV4T2YoQ29uZmlnLmFwaV9yb290KSA9PT0gLTEpIHtcbiAgICAgICAgICBlbmRwb2ludCA9IENvbmZpZy5hcGlfcm9vdCArIGVuZHBvaW50O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW5kcG9pbnQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnN2cEZvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge307XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7fTtcblxuICAgIHRoaXMub25ZZXMgPSB0aGlzLm9uWWVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbk5vcGUgPSB0aGlzLm9uTm9wZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vIGFkZCAuaGFzLXN1Y2Nlc3Mgb3IgLmhhcy1lcnJvclxuICAgIC8vIC5nbHlwaGljb24tb2sgb3IgLmdseXBoaWNvbi1yZW1vdmVcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICA8aDE+UlNWUCA8c21hbGw+QmFuZXJlbGxlIFdlZGRpbmc8L3NtYWxsPjwvaDE+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwibGVhZFwiPldlJ2QgbG92ZSBmb3IgeW91IHRvIGpvaW4gdXMuIFN0YXJ0IGJ5IGZpbmRpbmcgeW91ciBuYW1lOjwvcD5cbiAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJcIiByb2xlPVwiZm9ybVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgaGFzLXN1Y2Nlc3MgaGFzLWZlZWRiYWNrXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpbnB1dExhc3ROYW1lXCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIGlucHV0LWxnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIkxhc3QgbmFtZVwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnbHlwaGljb24gZ2x5cGhpY29uLW9rIGZvcm0tY29udHJvbC1mZWVkYmFja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICAgICAgICAgICAgPHA+UGljayBZb3VyIEVhdHM8L3A+XG4gICAgICAgICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJhZGlvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImZvb2RPcHRpb25zXCIgaWQ9XCJmb29kT3B0aW9uczFcIiB2YWx1ZT1cIkJ1cnJpdG9cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBCcmVha2Zhc3QgQnVycml0b1xuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmFkaW9cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiZm9vZE9wdGlvbnNcIiBpZD1cImZvb2RPcHRpb25zMlwiIHZhbHVlPVwiTWNNdWZmaW5cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBFZ2cgTWNNdWZmaW5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgICAgICAgICAgIDxwPkd1ZXN0PC9wPlxuICAgICAgICAgICAgICA8L2Jsb2NrcXVvdGU+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGVja2JveCBkaXNhYmxlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiKzFcIiBkaXNhYmxlZCAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICArMVxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzTmFtZT1cImJ0biBidG4tc3VjY2Vzc1wiIG9uQ2xpY2s9e3RoaXMub25ZZXN9PllFUzwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLWRhbmdlclwiIG9uQ2xpY2s9e3RoaXMub25Ob3BlfT5Ob3BlPC9idXR0b24+XG4gICAgICAgICAgPC9mb3JtPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIG9uWWVzKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5sb2coJ29uWWVzJyk7XG4gIH1cblxuICBvbk5vcGUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmxvZygnbm9wZScpO1xuICB9XG59IiwiLy8gbWFpbi5qc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEluaXRpYWxpemUgZnJvbSAnLi9VdGlscy9Jbml0aWFsaXplJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9VdGlscy9Sb3V0ZXMnO1xuXG4vLyBSdW4gdGhhdCBpbml0OlxuSW5pdGlhbGl6ZS5vbkxvYWQoKTtcblxuLy8gSW5pdGlhbGl6ZSBjdXJyZW50IHJvdXRlXG5Sb3V0ZXMuY3VycmVudCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpOyJdfQ==

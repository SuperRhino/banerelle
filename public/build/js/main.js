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
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require('react');var _react2=_interopRequireDefault(_react);var _Utils=require('../Utils/Utils');var _Utils2=_interopRequireDefault(_Utils);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass !== "function" && superClass !== null){throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var LoginForm=(function(_React$Component){_inherits(LoginForm,_React$Component);function LoginForm(props){_classCallCheck(this,LoginForm);var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(LoginForm).call(this,props));_this.state = {};_this.onSubmit = _this.onSubmit.bind(_this);return _this;}_createClass(LoginForm,[{key:'render',value:function render(){return _react2.default.createElement('form',{className:'navbar-form navbar-right',role:'form',onSubmit:this.onSubmit},_react2.default.createElement('div',{className:'form-group',style:styles.formField},_react2.default.createElement('input',{ref:'username',type:'text',placeholder:'username',className:'form-control'})),_react2.default.createElement('div',{className:'form-group',style:styles.formField},_react2.default.createElement('input',{ref:'password',type:'password',placeholder:'password',className:'form-control'})),_react2.default.createElement('button',{type:'submit',className:'btn btn-success'},'Sign in'));}},{key:'onSubmit',value:function onSubmit(e){e.preventDefault();var data={username:this.refs.username.value,password:this.refs.password.value};console.log('onSubmit:',_Utils2.default.buildUrl('/login'),data);}}]);return LoginForm;})(_react2.default.Component);LoginForm.propTypes = {};LoginForm.defaultProps = {};exports.default = LoginForm;var styles={formField:{margin:3}};

},{"../Utils/Utils":7,"react":"react"}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});var ENV='dev';var isProd=true,apiVersion='v1',apiHost='http://banerelle.com/api',siteRoot='http://banerelle.com';switch(ENV){case 'dev':isProd = false;apiHost = 'http://localhost:8888/api';siteRoot = 'http://localhost:8888';break;}var Config=exports.Config = {ENV:ENV,api_root:apiHost + '/',site_root:siteRoot + '/'};

},{}],5:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _jquery=require('jquery');var _jquery2=_interopRequireDefault(_jquery);var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _LoginForm=require('../Components/LoginForm');var _LoginForm2=_interopRequireDefault(_LoginForm);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Initialize=(function(){function Initialize(){_classCallCheck(this,Initialize);}_createClass(Initialize,null,[{key:'globals',value:function globals(){window.jQuery = _jquery2.default;}},{key:'bootstrap',value:function bootstrap(){require('bootstrap');}},{key:'onReady',value:function onReady(){document.getElementById('btnComingSoon').onclick = function(){if(ga)ga('send','event','buttons','click','stay tuned');console.log('send','event','buttons','click','stay tuned');return false;};_reactDom2.default.render(_react2.default.createElement(_LoginForm2.default,null),document.getElementById('LoginForm'));}},{key:'onLoad',value:function onLoad(){Initialize.globals();Initialize.bootstrap();Initialize.onReady();}}]);return Initialize;})();exports.default = Initialize;

},{"../Components/LoginForm":3,"bootstrap":"bootstrap","jquery":"jquery","react":"react","react-dom":"react-dom"}],6:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _path=require('path');var _path2=_interopRequireDefault(_path);var _Utils=require('../Utils/Utils');var _Utils2=_interopRequireDefault(_Utils);var _RsvpForm=require('../Views/RsvpForm');var _RsvpForm2=_interopRequireDefault(_RsvpForm);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Routes=(function(){function Routes(){_classCallCheck(this,Routes);}_createClass(Routes,null,[{key:'current',value:function current(pathname){var basename=_path2.default.basename(pathname) || Routes.homeRoute;var camelName=basename.replace(/-([a-z])/g,function(g){return g[1].toUpperCase();});if(typeof Routes[camelName] === 'function'){Routes[camelName]();}}},{key:'home',value:function home(){console.log('Home route');}},{key:'rsvp',value:function rsvp(){console.log('rsvp');_reactDom2.default.render(_react2.default.createElement(_RsvpForm2.default,null),document.getElementById('RsvpForm'));}}]);return Routes;})();Routes.homeRoute = 'home';exports.default = Routes;

},{"../Utils/Utils":7,"../Views/RsvpForm":8,"path":1,"react":"react","react-dom":"react-dom"}],7:[function(require,module,exports){
'use strict';var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _Constants=require('./Constants');function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var Utils=(function(){function Utils(){_classCallCheck(this,Utils);}_createClass(Utils,null,[{key:'getJSONP',value:function getJSONP(url,callback){var ref=window.document.getElementsByTagName('script')[0];var script=window.document.createElement('script');script.src = url + (url.indexOf('?') + 1?'&':'?') + 'callback=' + callback;ref.parentNode.insertBefore(script,ref);script.onload = function(){this.remove();};}},{key:'quoteRegex',value:function quoteRegex(regex){return regex.replace(/([()[{*+.$^\\|?])/g,'\\$1');}},{key:'trimChar',value:function trimChar(str,chr){chr = Utils.quoteRegex(chr);return str.replace(new RegExp('^' + chr + '+|' + chr + '+$','g'),"");}},{key:'buildUrl',value:function buildUrl(endpoint){endpoint = Utils.trimChar(endpoint,'/');if(endpoint.indexOf(_Constants.Config.api_root) === -1){endpoint = _Constants.Config.api_root + endpoint;}return endpoint;}}]);return Utils;})();exports.default = Utils;

},{"./Constants":4}],8:[function(require,module,exports){
"use strict";var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();Object.defineProperty(exports,"__esModule",{value:true});var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass !== "function" && superClass !== null){throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var RsvpForm=(function(_React$Component){_inherits(RsvpForm,_React$Component);function RsvpForm(props){_classCallCheck(this,RsvpForm);var _this=_possibleConstructorReturn(this,Object.getPrototypeOf(RsvpForm).call(this,props));_this.state = {};_this.onYes = _this.onYes.bind(_this);_this.onNope = _this.onNope.bind(_this);return _this;}_createClass(RsvpForm,[{key:"render",value:function render(){return _react2.default.createElement("div",{className:"row"},_react2.default.createElement("h1",null,"RSVP ",_react2.default.createElement("small",null,"Banerelle Wedding")),_react2.default.createElement("p",{className:"lead"},"We'd love for you to join us. Start by finding your name:"),_react2.default.createElement("form",{className:"",role:"form"},_react2.default.createElement("div",{className:"form-group has-success has-feedback"},_react2.default.createElement("input",{id:"inputLastName",className:"form-control input-lg",type:"text",placeholder:"Last name"}),_react2.default.createElement("span",{className:"glyphicon glyphicon-ok form-control-feedback","aria-hidden":"true"})),_react2.default.createElement("blockquote",null,_react2.default.createElement("p",null,"Pick Your Eats")),_react2.default.createElement("div",{className:"form-group"},_react2.default.createElement("div",{className:"radio"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"radio",name:"foodOptions",id:"foodOptions1",value:"Burrito"}),"Breakfast Burrito")),_react2.default.createElement("div",{className:"radio"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"radio",name:"foodOptions",id:"foodOptions2",value:"McMuffin"}),"Egg McMuffin"))),_react2.default.createElement("blockquote",null,_react2.default.createElement("p",null,"Guest")),_react2.default.createElement("div",{className:"form-group"},_react2.default.createElement("div",{className:"checkbox disabled"},_react2.default.createElement("label",null,_react2.default.createElement("input",{type:"checkbox",value:"+1",disabled:true}),"+1"))),_react2.default.createElement("button",{type:"submit",className:"btn btn-success",onClick:this.onYes},"YES"),_react2.default.createElement("button",{type:"button",className:"btn btn-danger",onClick:this.onNope},"Nope")));}},{key:"onYes",value:function onYes(e){e.preventDefault();console.log('onYes');}},{key:"onNope",value:function onNope(e){e.preventDefault();console.log('nope');}}]);return RsvpForm;})(_react2.default.Component);RsvpForm.propTypes = {};RsvpForm.defaultProps = {};exports.default = RsvpForm;

},{"react":"react"}],9:[function(require,module,exports){
'use strict';var _react=require('react');var _react2=_interopRequireDefault(_react);var _reactDom=require('react-dom');var _reactDom2=_interopRequireDefault(_reactDom);var _Initialize=require('./Utils/Initialize');var _Initialize2=_interopRequireDefault(_Initialize);var _Routes=require('./Utils/Routes');var _Routes2=_interopRequireDefault(_Routes);function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{default:obj};}_Initialize2.default.onLoad();_Routes2.default.current(window.location.pathname);

},{"./Utils/Initialize":5,"./Utils/Routes":6,"react":"react","react-dom":"react-dom"}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInJlc291cmNlcy9qcy9Db21wb25lbnRzL0xvZ2luRm9ybS5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Db25zdGFudHMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvSW5pdGlhbGl6ZS5qcyIsInJlc291cmNlcy9qcy9VdGlscy9Sb3V0ZXMuanMiLCJyZXNvdXJjZXMvanMvVXRpbHMvVXRpbHMuanMiLCJyZXNvdXJjZXMvanMvVmlld3MvUnN2cEZvcm0uanMiLCJyZXNvdXJjZXMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNyQixXQXBFa0IsUUFBUSxJQUFTLGdCQUFNLFNBQVMsRUFBaEMsUUFBUSxDQUNwQixTQUFTLEdBQUcsRUFBRSxDQURGLFFBQVEsQ0FFcEIsWUFBWSxHQUFHLEVBQUUsbUJBRkwsUUFBUTs7O21iQ0s3QixxQkFBVyxNQUFNLEVBQUUsQ0FBQyxBQUdwQixpQkFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBVdGlscyBmcm9tICcuLi9VdGlscy9VdGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2luRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7fTtcbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuXG4gICAgdGhpcy5vblN1Ym1pdCA9IHRoaXMub25TdWJtaXQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibmF2YmFyLWZvcm0gbmF2YmFyLXJpZ2h0XCIgcm9sZT1cImZvcm1cIiBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiIHN0eWxlPXtzdHlsZXMuZm9ybUZpZWxkfT5cbiAgICAgICAgICA8aW5wdXQgcmVmPVwidXNlcm5hbWVcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwidXNlcm5hbWVcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3N0eWxlcy5mb3JtRmllbGR9PlxuICAgICAgICAgIDxpbnB1dCByZWY9XCJwYXNzd29yZFwiIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwicGFzc3dvcmRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWNjZXNzXCI+U2lnbiBpbjwvYnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgICk7XG4gIH1cblxuICBvblN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgdXNlcm5hbWU6IHRoaXMucmVmcy51c2VybmFtZS52YWx1ZSxcbiAgICAgIHBhc3N3b3JkOiB0aGlzLnJlZnMucGFzc3dvcmQudmFsdWUsXG4gICAgfTtcblxuICAgIGNvbnNvbGUubG9nKCdvblN1Ym1pdDonLCBVdGlscy5idWlsZFVybCgnL2xvZ2luJyksIGRhdGEpO1xuICB9XG59XG5cbnZhciBzdHlsZXMgPSB7XG4gIGZvcm1GaWVsZDoge1xuICAgIG1hcmdpbjogMyxcbiAgfSxcbn07IiwidmFyIEVOViA9IChcbiAgICAnZGV2J1xuICAgIC8vJ3Byb2R1Y3Rpb24nXG4pO1xuXG52YXIgaXNQcm9kICAgICA9IHRydWUsXG4gICAgYXBpVmVyc2lvbiA9ICd2MScsXG4gICAgYXBpSG9zdCAgICA9ICdodHRwOi8vYmFuZXJlbGxlLmNvbS9hcGknLFxuICAgIHNpdGVSb290ICAgPSAnaHR0cDovL2JhbmVyZWxsZS5jb20nO1xuXG5zd2l0Y2ggKEVOVikge1xuICAgIGNhc2UgJ2Rldic6XG4gICAgICAgIGlzUHJvZCAgID0gZmFsc2U7XG4gICAgICAgIGFwaUhvc3QgID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9hcGknO1xuICAgICAgICBzaXRlUm9vdCA9ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnO1xuICAgICAgICBicmVhaztcbn1cblxuZXhwb3J0IHZhciBDb25maWcgPSB7XG4gIEVOVjogRU5WLFxuICBhcGlfcm9vdDogYXBpSG9zdCsnLycsXG4gIHNpdGVfcm9vdDogc2l0ZVJvb3QrJy8nXG59O1xuIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBMb2dpbkZvcm0gZnJvbSAnLi4vQ29tcG9uZW50cy9Mb2dpbkZvcm0nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbml0aWFsaXplIHtcblxuICBzdGF0aWMgZ2xvYmFscygpIHtcbiAgICAvLyBFeHBvc2UgZ2xvYmFscyBsaWtlIGpRdWVyeVxuICAgIHdpbmRvdy5qUXVlcnkgPSAkO1xuICB9XG5cbiAgc3RhdGljIGJvb3RzdHJhcCgpIHtcbiAgICByZXF1aXJlKCdib290c3RyYXAnKTtcbiAgfVxuXG4gIHN0YXRpYyBvblJlYWR5KCkge1xuICAgIC8vIENsaWNrIG9uIGJpZyBidXR0b246XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWluZ1Nvb24nKS5vbmNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmIChnYSkgZ2EoJ3NlbmQnLCAnZXZlbnQnLCAnYnV0dG9ucycsICdjbGljaycsICdzdGF5IHR1bmVkJyk7XG4gICAgICBjb25zb2xlLmxvZygnc2VuZCcsICdldmVudCcsICdidXR0b25zJywgJ2NsaWNrJywgJ3N0YXkgdHVuZWQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gU2hvdyB0aGF0IGxvZ2luIGZvcm06XG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPExvZ2luRm9ybSAvPixcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdMb2dpbkZvcm0nKVxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgb25Mb2FkKCkge1xuICAgIEluaXRpYWxpemUuZ2xvYmFscygpO1xuICAgIEluaXRpYWxpemUuYm9vdHN0cmFwKCk7XG4gICAgSW5pdGlhbGl6ZS5vblJlYWR5KCk7XG4gIH1cbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uL1V0aWxzL1V0aWxzJztcbmltcG9ydCBSc3ZwRm9ybSBmcm9tICcuLi9WaWV3cy9Sc3ZwRm9ybSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdXRlcyB7XG5cbiAgc3RhdGljIGhvbWVSb3V0ZSA9ICdob21lJztcblxuICBzdGF0aWMgY3VycmVudChwYXRobmFtZSkge1xuICAgIHZhciBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUocGF0aG5hbWUpIHx8IFJvdXRlcy5ob21lUm91dGU7XG4gICAgdmFyIGNhbWVsTmFtZSA9IGJhc2VuYW1lLnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uIChnKSB7IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKCk7IH0pO1xuICAgIGlmICh0eXBlb2YgUm91dGVzW2NhbWVsTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIFJvdXRlc1tjYW1lbE5hbWVdKCk7XG4gICAgfVxuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEN1c3RvbSBSb3V0ZXM6XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHN0YXRpYyBob21lKCkge1xuICAgIGNvbnNvbGUubG9nKCdIb21lIHJvdXRlJyk7XG4gIH1cblxuICBzdGF0aWMgcnN2cCgpIHtcbiAgICBjb25zb2xlLmxvZygncnN2cCcpO1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxSc3ZwRm9ybSAvPixcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdSc3ZwRm9ybScpXG4gICAgKTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBDb25maWcsIH0gZnJvbSAnLi9Db25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlscyB7XG5cbiAgLyoqXG4gICAqIEdldCBKU09OIGRhdGEgZnJvbSBhbm90aGVyIHNlcnZlci4gU3VwcG9ydGVkIGJhY2sgdG8gSUU2LlxuICAgKiBjcmVkaXQ6IGh0dHA6Ly9nb21ha2V0aGluZ3MuY29tL2RpdGNoaW5nLWpxdWVyeVxuICAgKiBAcGFyYW0gdXJsXG4gICAqIEBwYXJhbSBjYWxsYmFja1xuICAgKi9cbiAgc3RhdGljIGdldEpTT05QKHVybCwgY2FsbGJhY2spIHtcblxuICAgIC8vIENyZWF0ZSBzY3JpcHQgd2l0aCB1cmwgYW5kIGNhbGxiYWNrIChpZiBzcGVjaWZpZWQpXG4gICAgdmFyIHJlZiA9IHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ3NjcmlwdCcgKVsgMCBdO1xuICAgIHZhciBzY3JpcHQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NjcmlwdCcgKTtcbiAgICBzY3JpcHQuc3JjID0gdXJsICsgKHVybC5pbmRleE9mKCAnPycgKSArIDEgPyAnJicgOiAnPycpICsgJ2NhbGxiYWNrPScgKyBjYWxsYmFjaztcblxuICAgIC8vIEluc2VydCBzY3JpcHQgdGFnIGludG8gdGhlIERPTSAoYXBwZW5kIHRvIDxoZWFkPilcbiAgICByZWYucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIHNjcmlwdCwgcmVmICk7XG5cbiAgICAvLyBBZnRlciB0aGUgc2NyaXB0IGlzIGxvYWRlZCAoYW5kIGV4ZWN1dGVkKSwgcmVtb3ZlIGl0XG4gICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfTtcblxuICB9XG5cbiAgLyoqXG4gICAqIFF1b3RlcyB0aGUgZ2l2ZW4gc3RyaW5nIHNvIGl0IGNhbiBzYWZlbHkgYmUgdXNlZCBpbiBhIFJlZ3VsYXIgRXhwcmVzc2lvbi5cbiAgICogQHBhcmFtIHJlZ2V4XG4gICAqIEByZXR1cm5zIHsqfHN0cmluZ3x2b2lkfFhNTH1cbiAgICovXG4gIHN0YXRpYyBxdW90ZVJlZ2V4KHJlZ2V4KSB7XG4gICAgICByZXR1cm4gcmVnZXgucmVwbGFjZSgvKFsoKVt7KisuJF5cXFxcfD9dKS9nLCAnXFxcXCQxJyk7XG4gIH1cblxuICAvKipcbiAgICogVHJpbSB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGZyb20gYm90aCBlbmRzIG9mIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAqIEBwYXJhbSBzdHJcbiAgICogQHBhcmFtIGNoclxuICAgKiBAcmV0dXJucyB7KnxzdHJpbmd8dm9pZHxYTUx9XG4gICAqL1xuICBzdGF0aWMgdHJpbUNoYXIoc3RyLCBjaHIpIHtcbiAgICAgIGNociA9IFV0aWxzLnF1b3RlUmVnZXgoY2hyKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIGNociArICcrfCcgKyBjaHIgKyAnKyQnLCAnZycpLCBcIlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZW5kcG9pbnRcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBidWlsZFVybChlbmRwb2ludCkge1xuICAgICAgZW5kcG9pbnQgPSBVdGlscy50cmltQ2hhcihlbmRwb2ludCwgJy8nKTtcblxuICAgICAgaWYgKGVuZHBvaW50LmluZGV4T2YoQ29uZmlnLmFwaV9yb290KSA9PT0gLTEpIHtcbiAgICAgICAgICBlbmRwb2ludCA9IENvbmZpZy5hcGlfcm9vdCArIGVuZHBvaW50O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW5kcG9pbnQ7XG4gIH1cblxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnN2cEZvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge307XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7fTtcblxuICAgIHRoaXMub25ZZXMgPSB0aGlzLm9uWWVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbk5vcGUgPSB0aGlzLm9uTm9wZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIC8vIGFkZCAuaGFzLXN1Y2Nlc3Mgb3IgLmhhcy1lcnJvclxuICAgIC8vIC5nbHlwaGljb24tb2sgb3IgLmdseXBoaWNvbi1yZW1vdmVcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICA8aDE+UlNWUCA8c21hbGw+QmFuZXJlbGxlIFdlZGRpbmc8L3NtYWxsPjwvaDE+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwibGVhZFwiPldlJ2QgbG92ZSBmb3IgeW91IHRvIGpvaW4gdXMuIFN0YXJ0IGJ5IGZpbmRpbmcgeW91ciBuYW1lOjwvcD5cbiAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJcIiByb2xlPVwiZm9ybVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXAgaGFzLXN1Y2Nlc3MgaGFzLWZlZWRiYWNrXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpbnB1dExhc3ROYW1lXCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIGlucHV0LWxnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIkxhc3QgbmFtZVwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJnbHlwaGljb24gZ2x5cGhpY29uLW9rIGZvcm0tY29udHJvbC1mZWVkYmFja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxibG9ja3F1b3RlPlxuICAgICAgICAgICAgICAgICAgPHA+UGljayBZb3VyIEVhdHM8L3A+XG4gICAgICAgICAgICAgIDwvYmxvY2txdW90ZT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJhZGlvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImZvb2RPcHRpb25zXCIgaWQ9XCJmb29kT3B0aW9uczFcIiB2YWx1ZT1cIkJ1cnJpdG9cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBCcmVha2Zhc3QgQnVycml0b1xuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmFkaW9cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiZm9vZE9wdGlvbnNcIiBpZD1cImZvb2RPcHRpb25zMlwiIHZhbHVlPVwiTWNNdWZmaW5cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBFZ2cgTWNNdWZmaW5cbiAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8YmxvY2txdW90ZT5cbiAgICAgICAgICAgICAgICAgIDxwPkd1ZXN0PC9wPlxuICAgICAgICAgICAgICA8L2Jsb2NrcXVvdGU+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGVja2JveCBkaXNhYmxlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiKzFcIiBkaXNhYmxlZCAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICArMVxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzTmFtZT1cImJ0biBidG4tc3VjY2Vzc1wiIG9uQ2xpY2s9e3RoaXMub25ZZXN9PllFUzwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLWRhbmdlclwiIG9uQ2xpY2s9e3RoaXMub25Ob3BlfT5Ob3BlPC9idXR0b24+XG4gICAgICAgICAgPC9mb3JtPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIG9uWWVzKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc29sZS5sb2coJ29uWWVzJyk7XG4gIH1cblxuICBvbk5vcGUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmxvZygnbm9wZScpO1xuICB9XG59IiwiLy8gbWFpbi5qc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEluaXRpYWxpemUgZnJvbSAnLi9VdGlscy9Jbml0aWFsaXplJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9VdGlscy9Sb3V0ZXMnO1xuXG4vLyBSdW4gdGhhdCBpbml0OlxuSW5pdGlhbGl6ZS5vbkxvYWQoKTtcblxuLy8gSW5pdGlhbGl6ZSBjdXJyZW50IHJvdXRlXG5Sb3V0ZXMuY3VycmVudCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpOyJdfQ==

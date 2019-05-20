define(["module"], function (module) {
	"use strict";

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	var _get = function get(object, property, receiver) {
		if (object === null) object = Function.prototype;
		var desc = Object.getOwnPropertyDescriptor(object, property);

		if (desc === undefined) {
			var parent = Object.getPrototypeOf(object);

			if (parent === null) {
				return undefined;
			} else {
				return get(parent, property, receiver);
			}
		} else if ("value" in desc) {
			return desc.value;
		} else {
			var getter = desc.get;

			if (getter === undefined) {
				return undefined;
			}

			return getter.call(receiver);
		}
	};

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	//====base64.es6====//

	var Base64 = {

		// private property
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode: function encode(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = Base64._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = (chr1 & 3) << 4 | chr2 >> 4;
				enc3 = (chr2 & 15) << 2 | chr3 >> 6;
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
			}

			return output;
		},

		// public method for decoding
		decode: function decode(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = enc1 << 2 | enc2 >> 4;
				chr2 = (enc2 & 15) << 4 | enc3 >> 2;
				chr3 = (enc3 & 3) << 6 | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}

			output = Base64._utf8_decode(output);

			return output;
		},

		// private method for UTF-8 encoding
		_utf8_encode: function _utf8_encode(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if (c > 127 && c < 2048) {
					utftext += String.fromCharCode(c >> 6 | 192);
					utftext += String.fromCharCode(c & 63 | 128);
				} else {
					utftext += String.fromCharCode(c >> 12 | 224);
					utftext += String.fromCharCode(c >> 6 & 63 | 128);
					utftext += String.fromCharCode(c & 63 | 128);
				}
			}

			return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode: function _utf8_decode(utftext) {
			var string = "";
			var i = 0;
			var c = 0,
			    c1 = 0,
			    c2 = 0,
			    c3 = 0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if (c > 191 && c < 224) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode((c & 31) << 6 | c2 & 63);
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
					i += 3;
				}
			}

			return string;
		}

	};

	//====utils.es6====//

	var arrayProto = Array.prototype,
	    slice = arrayProto.slice,
	    obj = Object,
	    objProto = Object.prototype,
	    toString = objProto.toString,
	    assign = obj.assign,
	    strProto = String.prototype,
	    upper = strProto.toUpperCase;

	var reExt = /\.([a-z0-9-_]+)$/i,
	    reTrim = /^[\s\t\r\n]+|[\s\t\r\n]+$/g;

	function isString(obj) {
		return toString.call(obj) === '[object String]';
	}

	function trim(value) {
		return isString(value) ? value.replace(reTrim, '') : '';
	}

	function isArray(obj) {
		return toString.call(obj) === '[object Array]';
	}

	function isObject(obj) {
		return toString.call(obj) === '[object Object]';
	}

	function isUndefined(obj) {
		return typeof obj === 'undefined';
	}

	function undefinedOr(obj, then) {
		return typeof obj === 'undefined' ? then : obj;
	}

	function isset(obj) {
		return typeof obj === 'undefined' || obj === null;
	}

	function unsetOr(obj, then) {
		return typeof obj === 'undefined' || obj === null ? then : obj;
	}

	function emptyStrOr(value, then) {
		var trimValue = trim(value);
		return trimValue === '' ? then : value;
	}

	function jsonDecode(value, then) {
		var data;
		try {
			data = JSON.parse(value);
		} catch (error) {
			data = then;
			console.error('jsonDecode error', value, error);
		}
		return data;
	}

	function jsonEncode(value) {
		return JSON.stringify(value);
	}

	function diffDate(date) {
		var newDate = new Date();
		return newDate.valueOf() - date.valueOf();
	}

	function callFunc(bind, fn) {
		var args = [];
		if (typeof bind === 'function') {
			args = slice.call(arguments, 1);
			fn = bind;
			bind = null;
		} else {
			bind = bind || null;
			if (typeof fn !== 'function') return false;
			args = slice.call(arguments, 2);
		}
		fn.apply(bind, args);
		return true;
	}

	function round(value, precision) {
		if (isNaN(value)) value = 0.00;
		if (typeof precision === 'undefined' || isNaN(precision)) precision = 0;
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(value * precision) / precision;
	}

	var KB = 1024,
	    MB = 1024 * 1024,
	    GB = 1024 * 1024 * 1024,
	    TB = 1024 * 1024 * 1024 * 1024;

	function adjustSize(size, precision) {
		if (isNaN(precision) || precision <= 0) precision = 6;
		if (size < KB) return round(size, precision) + ' B';else if (size < MB) return round(size / KB, precision) + ' KB';else if (size < GB) return round(size / MB, precision) + ' MB';else if (size < TB) return round(size / GB, precision) + ' GB';else return round(size / TB, precision) + ' TB';
	}

	//====xhr.es6====//

	var xhrMethods = { GET: 'GET', POST: 'POST', DELETE: 'DELETE', PUT: 'PUT' },
	    xhrDefaultMethod = 'GET';

	function xhrFilterMethod(method) {
		return method && xhrMethods[upper.call(method)] || xhrDefaultMethod;
	}

	function initXhrOptions(url, options) {
		options = options || {};

		options.url = url;
		options.method = xhrFilterMethod(options.method);
		options.async = isUndefined(options.async, true);

		return options;
	}

	function initXhr(url, options) {
		if (typeof XMLHttpRequest === 'undefined' || XMLHttpRequest === null) throw new Error('Your browser unsupported XMLHttpRequest!');
		options = initXhrOptions(url, options);
		var xhr = new XMLHttpRequest(),
		    isError = false,
		    isAbort = false;
		xhr.open(options.method, options.url, options.async);
		xhr.onerror = function (event) {
			isError = true;
			callFunc(xhr, options.error, new Error('Network Error', url));
		};
		xhr.onabort = function (event) {
			isAbort = true;
			callFunc(xhr, options.abort);
		};
		xhr.onload = function (event) {
			if (!isAbort && !isError) {
				callFunc(xhr, options.done);
			}
		};
		xhr.onreadystatechange = function (event) {
			if (!isAbort && !isError) {
				if (xhr.status > 399 && xhr.status < 600) {
					isError = true;
					callFunc(xhr, options.error, new Error('HTTP status: ' + xhr.status, url));
				} else {
					switch (xhr.readyState) {
						case 2:
							callFunc(xhr, options.headers);
							break;
						case 3:
							callFunc(xhr, options.loading);
							break;
					}
				}
			}
		};
		xhr.send(null);
		return xhr;
	}

	//====cache.es6====//

	var cachedInstances = {},
	    cachedData = {};

	var supportLocalStorage = !(typeof localStorage === 'undefined' && localStorage === null);

	var LocalCached = function () {
		function LocalCached(key) {
			_classCallCheck(this, LocalCached);

			this.key = '';

			if (cachedInstances[key]) return cachedInstances[key];

			Object.defineProperties(this, {
				key: {
					value: key,
					readable: true,
					writable: false,
					enumerable: true
				}
			});

			cachedInstances[key] = this;
		}

		_createClass(LocalCached, [{
			key: "loadData",
			value: function loadData() {
				if (!cachedData[this.key]) {
					cachedData[this.key] = supportLocalStorage ? jsonDecode(localStorage.getItem(this.key), {}) : {};
				}
				return cachedData[this.key];
			}
		}, {
			key: "updateData",
			value: function updateData() {
				if (supportLocalStorage) {
					localStorage.setItem(this.key, jsonEncode(this.data));
				}
				return this;
			}
		}, {
			key: "toString",
			value: function toString() {
				return jsonEncode(this.data);
			}
		}, {
			key: "has",
			value: function has(name) {
				var cache = this.get(name);
				return typeof cache !== 'undefined';
			}
		}, {
			key: "get",
			value: function get(name) {
				var cached = this.loadData();
				return cached[name] || undefined;
			}
		}, {
			key: "set",
			value: function set(name, data) {
				var cached = this.loadData();
				cached[name] = data;
				this.updateData();
				return this;
			}
		}, {
			key: "data",
			get: function get() {
				return this.loadData();
			}
		}]);

		return LocalCached;
	}();

	;

	Object.defineProperties(LocalCached, {
		supportLocalStorage: {
			value: supportLocalStorage,
			readable: true,
			writable: false,
			enumerable: true
		}
	});

	var SourceCached = function (_LocalCached) {
		_inherits(SourceCached, _LocalCached);

		function SourceCached() {
			_classCallCheck(this, SourceCached);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(SourceCached).apply(this, arguments));
		}

		_createClass(SourceCached, [{
			key: "verify",
			value: function verify(data) {
				if (data && data.date && data.date > 0 && data.length && data.length > 0 && data.text && data.text != null) return data;
				return false;
			}
		}, {
			key: "compare",
			value: function compare(name, date, length) {
				var cache = this.get(name);
				if (cache === false || cache.date < date || cache.length !== length) return false;
				return cache;
			}
		}, {
			key: "get",
			value: function get(name) {
				return this.verify(_get(Object.getPrototypeOf(SourceCached.prototype), "get", this).call(this, name));
			}
		}, {
			key: "set",
			value: function set(name, cache) {
				if (this.verify(cache)) {
					_get(Object.getPrototypeOf(SourceCached.prototype), "set", this).call(this, name, cache);
				}
				return this;
			}
		}]);

		return SourceCached;
	}(LocalCached);

	//====loader.es6====//

	var anyInstance = null;

	var defaultCacheKey = 'require-any-cache';

	var AnyLoader = function () {
		function AnyLoader(config) {
			_classCallCheck(this, AnyLoader);

			this.xhr = initXhr;
			this.Base64 = Base64;
			this.LocalCached = LocalCached;
			this.isUndefined = isUndefined;
			this.isset = isset;
			this.isString = isString;
			this.trim = trim;
			this.isArray = isArray;
			this.isObject = isObject;
			this.undefinedOr = undefinedOr;
			this.unsetOr = unsetOr;
			this.emptyStrOr = emptyStrOr;
			this.callFunc = callFunc;
			this.round = round;
			this.jsonDecode = jsonDecode;
			this.jsonEncode = jsonEncode;
			this.diffDate = diffDate;
			this.adjustSize = adjustSize;

			if (anyInstance) return anyInstance;

			Object.defineProperties(this, {
				config: {
					value: config || {},
					readable: true,
					enumerable: true,
					writable: false
				},
				supportLocalStorage: {
					value: LocalCached.supportLocalStorage,
					readable: true,
					enumerable: true,
					writable: false
				}
			});

			anyInstance = this;
		}

		_createClass(AnyLoader, [{
			key: "match",
			value: function match(name) {
				var ps = this.patterns,
				    pl = ps.length;
				var plugin = false;
				if (pl > 0) {
					for (var i = 0; i < pl; i++) {
						var p = ps[i];
						if (p.regex) {
							var regex = p.regex;
							if (this.isString(regex) && regex !== '') regex = new RegExp(p.regex, p.mode || null);
							if (regex instanceof RegExp) {
								var match = name.match(regex);
								if (match) {
									this.callFunc(this, p.onMatch, name, match);
									plugin = p.plugin;
									break;
								}
							}
						}
					}
				}
				if (plugin === false) {
					plugin = this.getAliasExt(this.getFileExt(name));
				}
				return this.getPlugin(plugin);
			}
		}, {
			key: "getFileExt",
			value: function getFileExt(name) {
				var match = name.match(/\.([a-z0-9-_]+)$/i);
				if (match) return match[1].toLowerCase();
				return false;
			}
		}, {
			key: "getAliasExt",
			value: function getAliasExt(ext) {
				return this.exts[ext] || ext;
			}
		}, {
			key: "getPlugin",
			value: function getPlugin(plugin) {
				return this.plugins[plugin] || undefined;
			}
		}, {
			key: "getExtOptions",
			value: function getExtOptions(ext) {
				// 加载后缀的选项时，优先加载当前的选项。
				var options = this.options || {};
				if (options[ext]) return options[ext];
				ext = this.getAliasExt(ext);
				return options[ext] || {};
			}
		}, {
			key: "load",
			value: function load(name, req, _load, config) {
				if (this.isDebug > 1) console.log('load', name, req.toUrl(name));
				var plugin = void 0,
				    error = null;
				if (!this.isBuild) plugin = this.match(name);

				var onHandle = function onHandle(_plugin) {
					_plugin = _plugin || {};
					if (callFunc(_plugin.handle, name, req, _load, config) === false) _load.error(new Error('Invalid plugin handle in module ' + name));
				};

				switch (toString.call(plugin)) {
					case '[object Function]':
						onHandle({ handle: plugin });
						break;
					case '[object String]':
						req([plugin], onHandle);
						break;
					//case '[object Array]' :
					//	req(handle, onHandle);
					//	break;
					case '[object Object]':
						onHandle(plugin);
						break;
					default:
						error = new Error('Unknown handle with extension "' + ext + '"');
				}
				if (error != null) _load.error(error);
			}
		}, {
			key: "isDebug",
			get: function get() {
				if (!!this.config.debug) {
					if (isNaN(this.config.debug) || this.config.debug < 0) return 1;
					return this.config.debug;
				}
				return 0;
			}
		}, {
			key: "isBuild",
			get: function get() {
				return !!this.config.build;
			}
		}, {
			key: "cacheKey",
			get: function get() {
				return this.emptyStrOr(this.config.cacheKey, defaultCacheKey);
			}
		}, {
			key: "patterns",
			get: function get() {
				return this.isArray(this.config.patterns) ? this.config.patterns : [];
			}
		}, {
			key: "hasPatterns",
			get: function get() {
				return this.patterns.length <= 0;
			}
		}, {
			key: "exts",
			get: function get() {
				return this.config.ext || {};
			}
		}, {
			key: "plugins",
			get: function get() {
				return this.config.plugins || {};
			}
		}, {
			key: "options",
			get: function get() {
				return this.config.options || {};
			}
		}, {
			key: "cache",
			get: function get() {
				return new SourceCached(this.cacheKey);
			}
		}]);

		return AnyLoader;
	}();

	//////////////////////


	//====require-any exports====//
	//====Babel.settings====//
	//let options = {
	//	"presets": ["es2015"],
	//	"plugins": ["transform-es2015-modules-amd", "babel-plugin-transform-class-properties"],
	//};
	//"transform-es2015-modules-amd" => "transform-es2015-modules-umd"

	module.exports = new AnyLoader(module.config() || {});
});
//# sourceMappingURL=require-any.js.map

define('transpiler-coffee', ['any', 'coffee-script'], function (any, CoffeeScript) {

	var Base64 = any.Base64;

	function compile(name, url, text) {
		var ext = any.getFileExt(name);
		var options = any.getExtOptions(ext);
		options.literate = CoffeeScript.helpers.isLiterate(name);
		options.sourceMap = true;
		options.header = true;
		//options.inline = true;
		options.bare = true; // 不要闭包包围
		options.sourceFiles = [name + options.literate ? '' : '.coffee'];
		options.generatedFile = name + options.literate ? '' : '.coffee';

		var result = {
			js   : null,
			error: null
		};
		try {
			result = CoffeeScript.compile(text, options);
			result.text = result.js;
			result.text += '\n//# sourceMappingURL=data:application/json;base64,' + Base64.encode(result.v3SourceMap || '') + '\n//# sourceURL=' + url;
		} catch (err) {
			var msg = err.message;
			var loc = err.location;
			err.message = url;

			if (loc.first_line === loc.last_line) {
				err.message += ', line ' + (loc.first_line + 1);
			}
			else {
				err.message += ', lines ' + (loc.first_line + 1);
				if (isNaN(loc.last_line)) {
					err.message += '+';
				}
				else {
					err.message += '-' + (loc.last_line + 1);
				}
			}

			err.message += ': ' + msg;

			result.error = new SyntaxError(err.message, url, loc.first_line);

			if (any.isDebug)
				console.trace(result.error);
		}
		return result;
	}

	return {
		handle: function (name, req, load, config) {
			var date, dateInt, length = 0
				, ext = any.getFileExt(name)
				, url = req.toUrl(name)
			//>>debug<<
				, isDebug = any.isDebug
				, startDate = new Date()
				, debug = {src: 'cache', xhr: 0, handle: 0, lastModified: null, length: 0, url: url}
				;

			any.xhr(url, {
				error  : function (error) {
					load.error(error);
				},
				headers: function () {
					date = new Date(this.getResponseHeader('Last-Modified'));
					dateInt = date.valueOf();
					length = parseInt(this.getResponseHeader('Content-Length'));
					//>>debug<<
					var tempDate = new Date();
					if (isDebug) {
						debug.xhr = any.diffDate(startDate) + 'ms';
						debug.length = length;
						debug.lastModified = date;
					}
					var cache = any.cache.compare(name, dateInt, length);
					if (cache !== false) {
						this.abort();
						//>>debug<<
						if (isDebug) {
							debug.handle = any.diffDate(tempDate) + 'ms';
							debug.code = cache.text;
							console.debug(name, debug);
						}
						load.fromText(cache.text);
					}
				},
				done   : function () {
					//>>debug<<
					var tempDate = new Date();
					if (isDebug) {
						debug.src = 'update';
						debug.xhr = any.diffDate(startDate) + 'ms';
						debug.raw = this.response;
					}
					var onCompile = function (result) {
						//>>debug<<
						if (isDebug) {
							debug.handle = any.diffDate(tempDate) + 'ms';
						}
						if (result.error != null) {
							//>>debug<<
							if (isDebug) {
								debug.error = result.error;
								console.debug(name, debug);
							}
							load.error(result.error);
						}
						else {
							//>>debug<<
							if (isDebug) {
								debug.code = result.text;
								console.debug(name, debug);
							}
							any.cache.set(name, {
								date: dateInt,
								length: length,
								text: result.text
							});
							load.fromText(result.text);
						}
					};
					if (ext === 'cjsx') {
						var xhr = this;
						req(['transpiler-coffee-react'], function (transform) {
							onCompile(compile(name, url, transform(xhr.response)));
						});
					}
					else {
						onCompile(compile(name, url, this.response));
					}
				}
			});
		}
	};
});

//# sourceMappingURL=coffee.js.map

// https://wzrd.in/standalone/coffee-react-transform
// https://github.com/jsdf/coffee-react-transform

!function (e) {
	if ("object" == typeof exports && "undefined" != typeof module)module.exports = e(); else if ("function" == typeof define && define.amd)define('transpiler-coffee-react', [], e); else {
		var f;
		"undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.coffeeReactTransform = e()
	}
}(function () {
	var define, module, exports;
	return (function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;
					if (!u && a)return a(o, !0);
					if (i)return i(o, !0);
					var f = new Error("Cannot find module '" + o + "'");
					throw f.code = "MODULE_NOT_FOUND", f
				}
				var l = n[o] = {exports: {}};
				t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];
					return s(n ? n : e)
				}, l, l.exports, e, t, n, r)
			}
			return n[o].exports
		}

		var i = typeof require == "function" && require;
		for (var o = 0; o < r.length; o++)s(r[o]);
		return s
	})({
		1: [function (require, module, exports) {
			module.exports = require('./lib/transformer').transform;

		}, {"./lib/transformer": 8}],
		2: [function (require, module, exports) {
// from esprima-fb/esprima.js

			var XHTMLEntities = {
				quot: '\u0022',
				amp: '&',
				apos: "\u0027",
				lt: "<",
				gt: ">",
				nbsp: "\u00A0",
				iexcl: "\u00A1",
				cent: "\u00A2",
				pound: "\u00A3",
				curren: "\u00A4",
				yen: "\u00A5",
				brvbar: "\u00A6",
				sect: "\u00A7",
				uml: "\u00A8",
				copy: "\u00A9",
				ordf: "\u00AA",
				laquo: "\u00AB",
				not: "\u00AC",
				shy: "\u00AD",
				reg: "\u00AE",
				macr: "\u00AF",
				deg: "\u00B0",
				plusmn: "\u00B1",
				sup2: "\u00B2",
				sup3: "\u00B3",
				acute: "\u00B4",
				micro: "\u00B5",
				para: "\u00B6",
				middot: "\u00B7",
				cedil: "\u00B8",
				sup1: "\u00B9",
				ordm: "\u00BA",
				raquo: "\u00BB",
				frac14: "\u00BC",
				frac12: "\u00BD",
				frac34: "\u00BE",
				iquest: "\u00BF",
				Agrave: "\u00C0",
				Aacute: "\u00C1",
				Acirc: "\u00C2",
				Atilde: "\u00C3",
				Auml: "\u00C4",
				Aring: "\u00C5",
				AElig: "\u00C6",
				Ccedil: "\u00C7",
				Egrave: "\u00C8",
				Eacute: "\u00C9",
				Ecirc: "\u00CA",
				Euml: "\u00CB",
				Igrave: "\u00CC",
				Iacute: "\u00CD",
				Icirc: "\u00CE",
				Iuml: "\u00CF",
				ETH: "\u00D0",
				Ntilde: "\u00D1",
				Ograve: "\u00D2",
				Oacute: "\u00D3",
				Ocirc: "\u00D4",
				Otilde: "\u00D5",
				Ouml: "\u00D6",
				times: "\u00D7",
				Oslash: "\u00D8",
				Ugrave: "\u00D9",
				Uacute: "\u00DA",
				Ucirc: "\u00DB",
				Uuml: "\u00DC",
				Yacute: "\u00DD",
				THORN: "\u00DE",
				szlig: "\u00DF",
				agrave: "\u00E0",
				aacute: "\u00E1",
				acirc: "\u00E2",
				atilde: "\u00E3",
				auml: "\u00E4",
				aring: "\u00E5",
				aelig: "\u00E6",
				ccedil: "\u00E7",
				egrave: "\u00E8",
				eacute: "\u00E9",
				ecirc: "\u00EA",
				euml: "\u00EB",
				igrave: "\u00EC",
				iacute: "\u00ED",
				icirc: "\u00EE",
				iuml: "\u00EF",
				eth: "\u00F0",
				ntilde: "\u00F1",
				ograve: "\u00F2",
				oacute: "\u00F3",
				ocirc: "\u00F4",
				otilde: "\u00F5",
				ouml: "\u00F6",
				divide: "\u00F7",
				oslash: "\u00F8",
				ugrave: "\u00F9",
				uacute: "\u00FA",
				ucirc: "\u00FB",
				uuml: "\u00FC",
				yacute: "\u00FD",
				thorn: "\u00FE",
				yuml: "\u00FF",
				OElig: "\u0152",
				oelig: "\u0153",
				Scaron: "\u0160",
				scaron: "\u0161",
				Yuml: "\u0178",
				fnof: "\u0192",
				circ: "\u02C6",
				tilde: "\u02DC",
				Alpha: "\u0391",
				Beta: "\u0392",
				Gamma: "\u0393",
				Delta: "\u0394",
				Epsilon: "\u0395",
				Zeta: "\u0396",
				Eta: "\u0397",
				Theta: "\u0398",
				Iota: "\u0399",
				Kappa: "\u039A",
				Lambda: "\u039B",
				Mu: "\u039C",
				Nu: "\u039D",
				Xi: "\u039E",
				Omicron: "\u039F",
				Pi: "\u03A0",
				Rho: "\u03A1",
				Sigma: "\u03A3",
				Tau: "\u03A4",
				Upsilon: "\u03A5",
				Phi: "\u03A6",
				Chi: "\u03A7",
				Psi: "\u03A8",
				Omega: "\u03A9",
				alpha: "\u03B1",
				beta: "\u03B2",
				gamma: "\u03B3",
				delta: "\u03B4",
				epsilon: "\u03B5",
				zeta: "\u03B6",
				eta: "\u03B7",
				theta: "\u03B8",
				iota: "\u03B9",
				kappa: "\u03BA",
				lambda: "\u03BB",
				mu: "\u03BC",
				nu: "\u03BD",
				xi: "\u03BE",
				omicron: "\u03BF",
				pi: "\u03C0",
				rho: "\u03C1",
				sigmaf: "\u03C2",
				sigma: "\u03C3",
				tau: "\u03C4",
				upsilon: "\u03C5",
				phi: "\u03C6",
				chi: "\u03C7",
				psi: "\u03C8",
				omega: "\u03C9",
				thetasym: "\u03D1",
				upsih: "\u03D2",
				piv: "\u03D6",
				ensp: "\u2002",
				emsp: "\u2003",
				thinsp: "\u2009",
				zwnj: "\u200C",
				zwj: "\u200D",
				lrm: "\u200E",
				rlm: "\u200F",
				ndash: "\u2013",
				mdash: "\u2014",
				lsquo: "\u2018",
				rsquo: "\u2019",
				sbquo: "\u201A",
				ldquo: "\u201C",
				rdquo: "\u201D",
				bdquo: "\u201E",
				dagger: "\u2020",
				Dagger: "\u2021",
				bull: "\u2022",
				hellip: "\u2026",
				permil: "\u2030",
				prime: "\u2032",
				Prime: "\u2033",
				lsaquo: "\u2039",
				rsaquo: "\u203A",
				oline: "\u203E",
				frasl: "\u2044",
				euro: "\u20AC",
				image: "\u2111",
				weierp: "\u2118",
				real: "\u211C",
				trade: "\u2122",
				alefsym: "\u2135",
				larr: "\u2190",
				uarr: "\u2191",
				rarr: "\u2192",
				darr: "\u2193",
				harr: "\u2194",
				crarr: "\u21B5",
				lArr: "\u21D0",
				uArr: "\u21D1",
				rArr: "\u21D2",
				dArr: "\u21D3",
				hArr: "\u21D4",
				forall: "\u2200",
				part: "\u2202",
				exist: "\u2203",
				empty: "\u2205",
				nabla: "\u2207",
				isin: "\u2208",
				notin: "\u2209",
				ni: "\u220B",
				prod: "\u220F",
				sum: "\u2211",
				minus: "\u2212",
				lowast: "\u2217",
				radic: "\u221A",
				prop: "\u221D",
				infin: "\u221E",
				ang: "\u2220",
				and: "\u2227",
				or: "\u2228",
				cap: "\u2229",
				cup: "\u222A",
				"int": "\u222B",
				there4: "\u2234",
				sim: "\u223C",
				cong: "\u2245",
				asymp: "\u2248",
				ne: "\u2260",
				equiv: "\u2261",
				le: "\u2264",
				ge: "\u2265",
				sub: "\u2282",
				sup: "\u2283",
				nsub: "\u2284",
				sube: "\u2286",
				supe: "\u2287",
				oplus: "\u2295",
				otimes: "\u2297",
				perp: "\u22A5",
				sdot: "\u22C5",
				lceil: "\u2308",
				rceil: "\u2309",
				lfloor: "\u230A",
				rfloor: "\u230B",
				lang: "\u2329",
				rang: "\u232A",
				loz: "\u25CA",
				spades: "\u2660",
				clubs: "\u2663",
				hearts: "\u2665",
				diams: "\u2666"
			};

			module.exports = function decode(str) {
				return str
					.replace(/&#(\d+);?/g, function (_, code) {
						return String.fromCharCode(parseInt(code, 10));
					})
					.replace(/&#[xX]([A-Fa-f0-9]+);?/g, function (_, hex) {
						return String.fromCharCode(parseInt(hex, 16));
					})
					.replace(/&([^;\W]+;?)/g, function (m, e) {
						var ee = e.replace(/;$/, '');
						var entity = XHTMLEntities[e]
								|| (e.match(/;$/) && XHTMLEntities[ee])
							;

						if (entity) {
							return entity;
						}
						else {
							return m;
						}
					})
			}

		}, {}],
		3: [function (require, module, exports) {
			(function (process) {
// Generated by CoffeeScript 1.9.3
				var extend, flatten, last, ref, ref1, repeat, syntaxErrorToString;

				exports.starts = function (string, literal, start) {
					return literal === string.substr(start, literal.length);
				};

				exports.ends = function (string, literal, back) {
					var len;
					len = literal.length;
					return literal === string.substr(string.length - len - (back || 0), len);
				};

				exports.repeat = repeat = function (str, n) {
					var res;
					res = '';
					while (n > 0) {
						if (n & 1) {
							res += str;
						}
						n >>>= 1;
						str += str;
					}
					return res;
				};

				exports.compact = function (array) {
					var i, item, len1, results;
					results = [];
					for (i = 0, len1 = array.length; i < len1; i++) {
						item = array[i];
						if (item) {
							results.push(item);
						}
					}
					return results;
				};

				exports.count = function (string, substr) {
					var num, pos;
					num = pos = 0;
					if (!substr.length) {
						return 1 / 0;
					}
					while (pos = 1 + string.indexOf(substr, pos)) {
						num++;
					}
					return num;
				};

				exports.merge = function (options, overrides) {
					return extend(extend({}, options), overrides);
				};

				extend = exports.extend = function (object, properties) {
					var key, val;
					for (key in properties) {
						val = properties[key];
						object[key] = val;
					}
					return object;
				};

				exports.flatten = flatten = function (array) {
					var element, flattened, i, len1;
					flattened = [];
					for (i = 0, len1 = array.length; i < len1; i++) {
						element = array[i];
						if (element instanceof Array) {
							flattened = flattened.concat(flatten(element));
						} else {
							flattened.push(element);
						}
					}
					return flattened;
				};

				exports.del = function (obj, key) {
					var val;
					val = obj[key];
					delete obj[key];
					return val;
				};

				exports.last = last = function (array, back) {
					return array[array.length - (back || 0) - 1];
				};

				exports.some = (ref = Array.prototype.some) != null ? ref : function (fn) {
					var e, i, len1;
					for (i = 0, len1 = this.length; i < len1; i++) {
						e = this[i];
						if (fn(e)) {
							return true;
						}
					}
					return false;
				};

				exports.find = (ref1 = Array.prototype.find) != null ? ref1 : function (fn) {
					var e, i, len1;
					for (i = 0, len1 = this.length; i < len1; i++) {
						e = this[i];
						if (fn(e)) {
							return e;
						}
					}
				};

				exports.throwSyntaxError = function (message, location) {
					var error;
					error = new SyntaxError(message);
					error.location = location;
					error.toString = syntaxErrorToString;
					error.stack = error.toString();
					throw error;
				};

				exports.updateSyntaxError = function (error, code, filename) {
					if (error.toString === syntaxErrorToString) {
						error.code || (error.code = code);
						error.filename || (error.filename = filename);
						error.stack = error.toString();
					}
					return error;
				};

				syntaxErrorToString = function () {
					var codeLine, colorize, colorsEnabled, end, filename, first_column, first_line, last_column, last_line, marker, ref2, ref3, start;
					if (!(this.code && this.location)) {
						return Error.prototype.toString.call(this);
					}
					ref2 = this.location, first_line = ref2.first_line, first_column = ref2.first_column, last_line = ref2.last_line, last_column = ref2.last_column;
					if (last_line == null) {
						last_line = first_line;
					}
					if (last_column == null) {
						last_column = first_column;
					}
					filename = this.filename || '[stdin]';
					codeLine = this.code.split('\n')[first_line];
					start = first_column;
					end = first_line === last_line ? last_column + 1 : codeLine.length;
					marker = repeat(' ', start) + repeat('^', end - start);
					if (typeof process !== "undefined" && process !== null) {
						colorsEnabled = process.stdout.isTTY && !process.env.NODE_DISABLE_COLORS;
					}
					if ((ref3 = this.colorful) != null ? ref3 : colorsEnabled) {
						colorize = function (str) {
							return "\x1B[1;31m" + str + "\x1B[0m";
						};
						codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
						marker = colorize(marker);
					}
					return filename + ":" + (first_line + 1) + ":" + (first_column + 1) + ": error: " + this.message + "\n" + codeLine + "\n" + marker;
				};

				exports.nameWhitespaceCharacter = function (string) {
					switch (string) {
						case ' ':
							return 'space';
						case '\n':
							return 'newline';
						case '\r':
							return 'carriage return';
						case '\t':
							return 'tab';
						default:
							return string;
					}
				};

				exports.invertLiterate = function (code) {
					var line, lines, maybe_code;
					maybe_code = true;
					lines = (function () {
						var i, len1, ref2, results;
						ref2 = code.split('\n');
						results = [];
						for (i = 0, len1 = ref2.length; i < len1; i++) {
							line = ref2[i];
							if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
								results.push(line);
							} else if (maybe_code = /^\s*$/.test(line)) {
								results.push(line);
							} else {
								results.push('# ' + line);
							}
						}
						return results;
					})();
					return lines.join('\n');
				};

			}).call(this, require('_process'))
		}, {"_process": 9}],
		4: [function (require, module, exports) {
// Generated by CoffeeScript 1.9.3
			var $, BOM, CJSX_ESC_COMMENT, CLOSING_TAG, COMMENT, HEREDOC, HEREGEX, JSTOKEN, OPENING_TAG, PRAGMA, ParseTreeBranchNode, ParseTreeLeafNode, Parser, REGEX, SIMPLESTR, TAG_ATTRIBUTES, TRAILING_SPACES, WHITESPACE, compact, count, invertLiterate, last, ref, repeat, starts, throwSyntaxError;

			ref = require('./helpers'), count = ref.count, starts = ref.starts, compact = ref.compact, last = ref.last, repeat = ref.repeat, throwSyntaxError = ref.throwSyntaxError, invertLiterate = ref.invertLiterate;

			$ = require('./symbols');

			ParseTreeLeafNode = function (type, value) {
				if (value == null) {
					value = null;
				}
				return {
					type: type,
					value: value
				};
			};

			ParseTreeBranchNode = function (type, value, children) {
				if (value == null) {
					value = null;
				}
				if (children == null) {
					children = [];
				}
				return {
					type: type,
					value: value,
					children: children
				};
			};

			module.exports = Parser = (function () {
				function Parser() {
				}

				Parser.prototype.parse = function (code, opts) {
					var consumed, i, message, ref1, ref2;
					this.opts = opts != null ? opts : {};
					this.parseTree = ParseTreeBranchNode(this.opts.root || $.ROOT);
					this.activeStates = [this.parseTree];
					this.chunkLine = 0;
					this.chunkColumn = 0;
					this.cjsxPragmaChecked = false;
					code = this.clean(code);
					i = 0;
					while ((this.chunk = code.slice(i))) {
						if (this.activeStates.length === 0) {
							break;
						}
						consumed = ((ref1 = this.currentState()) !== $.CJSX_EL && ref1 !== $.CJSX_ATTRIBUTES ? this.csComment() || this.csHeredoc() || this.csString() || this.csRegex() || this.jsEscaped() : void 0) || this.cjsxStart() || this.cjsxAttribute() || this.cjsxComment() || this.cjsxEscape() || this.cjsxUnescape() || this.cjsxEnd() || this.cjsxText() || this.coffeescriptCode();
						ref2 = this.getLineAndColumnFromChunk(consumed), this.chunkLine = ref2[0], this.chunkColumn = ref2[1];
						i += consumed;
					}
					if ((this.activeBranchNode() != null) && this.activeBranchNode() !== this.parseTree) {
						message = "Unexpected end of input: unclosed " + (this.currentState());
						throwSyntaxError(message, {
							first_line: this.chunkLine,
							first_column: this.chunkColumn
						});
					}
					this.remainder = code.slice(i);
					if (!this.opts.recursive) {
						if (this.remainder.length) {
							throwSyntaxError("Unexpected return from root state", {
								first_line: this.chunkLine,
								first_column: this.chunkColumn
							});
						}
					}
					return this.parseTree;
				};

				Parser.prototype.csComment = function () {
					var comment, here, match, pragmaMatch, prefix;
					if (!(match = this.chunk.match(COMMENT))) {
						return 0;
					}
					comment = match[0], here = match[1];
					if (!this.cjsxPragmaChecked) {
						this.cjsxPragmaChecked = true;
						if (pragmaMatch = comment.match(PRAGMA)) {
							if (pragmaMatch && pragmaMatch[1] && pragmaMatch[1].length) {
								prefix = pragmaMatch[1];
							} else {
								prefix = 'React.DOM';
							}
							this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_PRAGMA, prefix));
							return comment.length;
						}
					}
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS_COMMENT, comment));
					return comment.length;
				};

				Parser.prototype.csHeredoc = function () {
					var heredoc, match;
					if (!(match = HEREDOC.exec(this.chunk))) {
						return 0;
					}
					heredoc = match[0];
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS_HEREDOC, heredoc));
					return heredoc.length;
				};

				Parser.prototype.csString = function () {
					var quote, string;
					switch (quote = this.chunk.charAt(0)) {
						case "'":
							string = SIMPLESTR.exec(this.chunk)[0];
							break;
						case '"':
							string = this.balancedString(this.chunk, '"');
					}
					if (!string) {
						return 0;
					}
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS_STRING, string));
					return string.length;
				};

				Parser.prototype.csRegex = function () {
					var flags, length, match, ref1, regex;
					if (this.chunk.charAt(0) !== '/') {
						return 0;
					}
					if (length = this.csHeregex()) {
						return length;
					}
					if (!(match = REGEX.exec(this.chunk))) {
						return 0;
					}
					ref1 = match, match = ref1[0], regex = ref1[1], flags = ref1[2];
					if (regex.indexOf("\n") > -1) {
						return 0;
					}
					if (regex === '//') {
						return 0;
					}
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS_REGEX, match));
					return match.length;
				};

				Parser.prototype.csHeregex = function () {
					var body, flags, heregex, match;
					if (!(match = HEREGEX.exec(this.chunk))) {
						return 0;
					}
					heregex = match[0], body = match[1], flags = match[2];
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS_HEREGEX, heregex));
					return heregex.length;
				};

				Parser.prototype.jsEscaped = function () {
					var match, script;
					if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
						return 0;
					}
					script = match[0];
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.JS_ESC, script));
					return script.length;
				};

				Parser.prototype.cjsxStart = function () {
					var attributesText, input, match, selfClosing, tagName;
					if (!(match = OPENING_TAG.exec(this.chunk))) {
						return 0;
					}
					input = match[0], tagName = match[1], attributesText = match[2], selfClosing = match[3];
					if (!(selfClosing || this.chunk.indexOf("</" + tagName + ">", input.length) > -1)) {
						return 0;
					}
					this.pushActiveBranchNode(ParseTreeBranchNode($.CJSX_EL, tagName));
					this.pushActiveBranchNode(ParseTreeBranchNode($.CJSX_ATTRIBUTES));
					return 1 + tagName.length;
				};

				Parser.prototype.cjsxAttribute = function () {
					var attrName, bareVal, cjsxEscVal, doubleQuotedVal, input, match, singleQuotedVal, spreadAttr, whitespace;
					if (this.currentState() !== $.CJSX_ATTRIBUTES) {
						return 0;
					}
					if (this.chunk.charAt(0) === '/') {
						if (this.chunk.charAt(1) === '>') {
							this.popActiveBranchNode();
							this.popActiveBranchNode();
							return 2;
						} else {
							throwSyntaxError("/ without immediately following > in CJSX tag " + (this.peekActiveState(2).value), {
								first_line: this.chunkLine,
								first_column: this.chunkColumn
							});
						}
					}
					if (this.chunk.charAt(0) === '>') {
						this.popActiveBranchNode();
						return 1;
					}
					if (!(match = TAG_ATTRIBUTES.exec(this.chunk))) {
						return 0;
					}
					input = match[0], attrName = match[1], doubleQuotedVal = match[2], singleQuotedVal = match[3], cjsxEscVal = match[4], bareVal = match[5], spreadAttr = match[6], whitespace = match[7];
					if (attrName) {
						if (doubleQuotedVal != null) {
							this.addLeafNodeToActiveBranch(ParseTreeBranchNode($.CJSX_ATTR_PAIR, null, [ParseTreeLeafNode($.CJSX_ATTR_KEY, "\"" + attrName + "\""), ParseTreeLeafNode($.CJSX_ATTR_VAL, "\"" + doubleQuotedVal + "\"")]));
							return input.length;
						} else if (singleQuotedVal != null) {
							this.addLeafNodeToActiveBranch(ParseTreeBranchNode($.CJSX_ATTR_PAIR, null, [ParseTreeLeafNode($.CJSX_ATTR_KEY, "\"" + attrName + "\""), ParseTreeLeafNode($.CJSX_ATTR_VAL, "'" + singleQuotedVal + "'")]));
							return input.length;
						} else if (cjsxEscVal) {
							this.pushActiveBranchNode(ParseTreeBranchNode($.CJSX_ATTR_PAIR));
							this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_ATTR_KEY, "\"" + attrName + "\""));
							return input.indexOf('{');
						} else if (bareVal) {
							this.addLeafNodeToActiveBranch(ParseTreeBranchNode($.CJSX_ATTR_PAIR, null, [ParseTreeLeafNode($.CJSX_ATTR_KEY, "\"" + attrName + "\""), ParseTreeLeafNode($.CJSX_ATTR_VAL, bareVal)]));
							return input.length;
						} else {
							this.addLeafNodeToActiveBranch(ParseTreeBranchNode($.CJSX_ATTR_PAIR, null, [ParseTreeLeafNode($.CJSX_ATTR_KEY, "\"" + attrName + "\""), ParseTreeLeafNode($.CJSX_ATTR_VAL, 'true')]));
							return input.length;
						}
					} else if (spreadAttr) {
						this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_ATTR_SPREAD, spreadAttr));
						return input.length;
					} else if (whitespace != null) {
						this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_WHITESPACE, whitespace));
						return input.length;
					} else {
						return throwSyntaxError("Invalid attribute " + input + " in CJSX tag " + (this.peekActiveState(2).value), {
							first_line: this.chunkLine,
							first_column: this.chunkColumn
						});
					}
				};

				Parser.prototype.cjsxComment = function () {
					var match;
					match = this.chunk.match(CJSX_ESC_COMMENT);
					if (!match) {
						return 0;
					}
					this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_COMMENT, match[1]));
					return match[0].length;
				};

				Parser.prototype.cjsxEscape = function () {
					var ref1;
					if (!(this.chunk.charAt(0) === '{' && ((ref1 = this.currentState()) === $.CJSX_EL || ref1 === $.CJSX_ATTR_PAIR))) {
						return 0;
					}
					this.pushActiveBranchNode(ParseTreeBranchNode($.CJSX_ESC));
					this.activeBranchNode().stack = 1;
					return 1;
				};

				Parser.prototype.cjsxUnescape = function () {
					var ref1;
					if (!(this.currentState() === $.CJSX_ESC && this.chunk.charAt(0) === '}')) {
						return 0;
					}
					if (this.activeBranchNode().stack === 0) {
						this.popActiveBranchNode();
						if ((ref1 = this.currentState()) === $.CJSX_ATTR_PAIR) {
							this.popActiveBranchNode();
						}
						return 1;
					} else {
						return 0;
					}
				};

				Parser.prototype.cjsxEnd = function () {
					var input, match, tagName;
					if (this.currentState() !== $.CJSX_EL) {
						return 0;
					}
					if (!(match = CLOSING_TAG.exec(this.chunk))) {
						return 0;
					}
					input = match[0], tagName = match[1];
					if (tagName !== this.activeBranchNode().value) {
						throwSyntaxError("opening CJSX tag " + (this.activeBranchNode().value) + " doesn't match closing CJSX tag " + tagName, {
							first_line: this.chunkLine,
							first_column: this.chunkColumn
						});
					}
					this.popActiveBranchNode();
					return input.length;
				};

				Parser.prototype.cjsxText = function () {
					if (this.currentState() !== $.CJSX_EL) {
						return 0;
					}
					if (this.newestNode().type !== $.CJSX_TEXT) {
						this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CJSX_TEXT, ''));
					}
					this.newestNode().value += this.chunk.charAt(0);
					return 1;
				};

				Parser.prototype.coffeescriptCode = function () {
					if (this.currentState() === $.CJSX_ESC) {
						if (this.chunk.charAt(0) === '{') {
							this.activeBranchNode().stack++;
						} else if (this.chunk.charAt(0) === '}') {
							this.activeBranchNode().stack--;
							if (this.activeBranchNode().stack === 0) {
								return 0;
							}
						}
					}
					if (this.newestNode().type !== $.CS) {
						this.addLeafNodeToActiveBranch(ParseTreeLeafNode($.CS, ''));
					}
					this.newestNode().value += this.chunk.charAt(0);
					return 1;
				};

				Parser.prototype.activeBranchNode = function () {
					return last(this.activeStates);
				};

				Parser.prototype.peekActiveState = function (depth) {
					if (depth == null) {
						depth = 1;
					}
					return this.activeStates.slice(-depth)[0];
				};

				Parser.prototype.currentState = function () {
					return this.activeBranchNode().type;
				};

				Parser.prototype.newestNode = function () {
					return last(this.activeBranchNode().children) || this.activeBranchNode();
				};

				Parser.prototype.pushActiveBranchNode = function (node) {
					this.activeBranchNode().children.push(node);
					return this.activeStates.push(node);
				};

				Parser.prototype.popActiveBranchNode = function () {
					return this.activeStates.pop();
				};

				Parser.prototype.addLeafNodeToActiveBranch = function (node) {
					return this.activeBranchNode().children.push(node);
				};

				Parser.prototype.clean = function (code) {
					var ref1;
					if (code.charCodeAt(0) === BOM) {
						code = code.slice(1);
					}
					code = code.replace(/\r/g, '');
					if ((ref1 = this.opts) != null ? ref1.literate : void 0) {
						code = invertLiterate(code);
					}
					return code;
				};

				Parser.prototype.getLineAndColumnFromChunk = function (offset) {
					var column, lineCount, lines, string;
					if (offset === 0) {
						return [this.chunkLine, this.chunkColumn];
					}
					if (offset >= this.chunk.length) {
						string = this.chunk;
					} else {
						string = this.chunk.slice(0, +(offset - 1) + 1 || 9e9);
					}
					lineCount = count(string, '\n');
					column = this.chunkColumn;
					if (lineCount > 0) {
						lines = string.split('\n');
						column = last(lines).length;
					} else {
						column += string.length;
					}
					return [this.chunkLine + lineCount, column];
				};

				Parser.prototype.balancedString = function (str, end) {
					var continueCount, i, j, letter, match, prev, ref1, stack;
					continueCount = 0;
					stack = [end];
					for (i = j = 1, ref1 = str.length; 1 <= ref1 ? j < ref1 : j > ref1; i = 1 <= ref1 ? ++j : --j) {
						if (continueCount) {
							--continueCount;
							continue;
						}
						switch (letter = str.charAt(i)) {
							case '\\':
								++continueCount;
								continue;
							case end:
								stack.pop();
								if (!stack.length) {
									return str.slice(0, +i + 1 || 9e9);
								}
								end = stack[stack.length - 1];
								continue;
						}
						if (end === '}' && (letter === '"' || letter === "'")) {
							stack.push(end = letter);
						} else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
							continueCount += match[0].length - 1;
						} else if (end === '}' && letter === '{') {
							stack.push(end = '}');
						} else if (end === '"' && prev === '#' && letter === '{') {
							stack.push(end = '}');
						}
						prev = letter;
					}
					return throwSyntaxError("missing " + (stack.pop()) + ", starting");
				};

				return Parser;

			})();

			OPENING_TAG = /^<(@?[-A-Za-z0-9_\.]+)((?:(?:(?:\s+[\w-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:{[\s\S]*?})|[^>\s]+)))|\s+[\w-]+|\s+\{\.\.\.\s*?[^{}]+?\s*?\})?)*?\s*)(\/?)>/;

			CLOSING_TAG = /^<\/(@?[-A-Za-z0-9_\.]+)[^>]*>/;

			TAG_ATTRIBUTES = /(?:([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(?:{((?:\\.|[\s\S])*)})|([^>\s]+)))?)|(?:\{\.\.\.(\s*?[^{}]+?\s*?)\})|([\s\n]+)/;

			PRAGMA = /^\s*#\s*@cjsx\s+(\S*)/i;

			CJSX_ESC_COMMENT = /^\{#(.*)\}/;

			BOM = 65279;

			WHITESPACE = /^[^\n\S]+/;

			COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

			TRAILING_SPACES = /\s+$/;

			HEREDOC = /^("""|''')((?:\\[\s\S]|[^\\])*?)(?:\n[^\n\S]*)?\1/;

			SIMPLESTR = /^'[^\\']*(?:\\[\s\S][^\\']*)*'/;

			JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

			REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

			HEREGEX = /^\/{3}((?:\\?[\s\S])+?)\/{3}([imgy]{0,4})(?!\w)/;

		}, {"./helpers": 3, "./symbols": 7}],
		5: [function (require, module, exports) {
// Generated by CoffeeScript 1.9.3
			var $, SPACES_ONLY, Serialiser, TEXT_LEADING_WHITESPACE, TEXT_TRAILING_WHITESPACE, WHITESPACE_ONLY, componentClassTagConvention, containsNewlines, entityDecode, exports, find, firstNonWhitespaceChild, genericBranchSerialiser, genericLeafSerialiser, joinList, last, nodeSerialisers, ref, serialise, stringEscape;

			ref = require('./helpers'), last = ref.last, find = ref.find;

			$ = require('./symbols');

			stringEscape = require('./stringescape');

			entityDecode = require('./entitydecode');

			module.exports = exports = serialise = function (parseTree) {
				return new Serialiser().serialise(parseTree);
			};

			Serialiser = (function () {
				function Serialiser() {
				}

				Serialiser.prototype.serialise = function (parseTree) {
					var domObjectParts;
					if (parseTree.children && parseTree.children.length && parseTree.children[0].type === $.CJSX_PRAGMA) {
						this.domObject = parseTree.children[0].value;
					} else {
						this.domObject = 'React.DOM';
					}
					domObjectParts = this.domObject.split('.');
					if (domObjectParts.length > 0 && domObjectParts[0] !== '') {
						this.reactObject = domObjectParts[0];
					} else {
						this.reactObject = 'React';
					}
					return this.serialiseNode(parseTree);
				};

				Serialiser.prototype.serialiseNode = function (node) {
					var serialised;
					if (nodeSerialisers[node.type] == null) {
						throw new Error("unknown parseTree node type " + node.type);
					}
					serialised = nodeSerialisers[node.type].call(this, node);
					if (!(typeof serialised === 'string' || serialised === null)) {
						throw new Error("serialiser " + node.type + " didn\'t return a string");
					}
					return serialised;
				};

				Serialiser.prototype.serialiseSpreadAndPairAttributes = function (children) {
					var accumulatedWhitespace, assignIndex, assignItem, assigns, assignsWithWhitespace, child, childIndex, flushPairs, j, joinedAssigns, k, lastAssignWithWhitespace, len, len1, pairAttrsBuffer, ref1, trailingWhiteplace;
					assigns = [];
					pairAttrsBuffer = [];
					flushPairs = (function (_this) {
						return function () {
							var serialisedChild, serialisedPairs;
							if (pairAttrsBuffer.length) {
								serialisedChild = _this.serialiseAttributePairs(pairAttrsBuffer);
								if (serialisedChild) {
									assigns.push({
										type: $.CS,
										value: serialisedChild
									});
								} else {
									serialisedPairs = pairAttrsBuffer.map(function (p) {
										return _this.serialiseNode(p);
									}).join('').replace('\n', '\\\n');
									assigns.push({
										type: $.CJSX_WHITESPACE,
										value: serialisedPairs
									});
								}
								return pairAttrsBuffer = [];
							}
						};
					})(this);
					if (((ref1 = firstNonWhitespaceChild(children)) != null ? ref1.type : void 0) === $.CJSX_ATTR_SPREAD) {
						assigns.push({
							type: $.CS,
							value: '{}'
						});
					}
					for (childIndex = j = 0, len = children.length; j < len; childIndex = ++j) {
						child = children[childIndex];
						if (child.type === $.CJSX_ATTR_SPREAD) {
							flushPairs();
							assigns.push({
								type: $.CS,
								value: child.value
							});
						} else {
							pairAttrsBuffer.push(child);
						}
					}
					flushPairs();
					accumulatedWhitespace = '';
					assignsWithWhitespace = [];
					for (assignIndex = k = 0, len1 = assigns.length; k < len1; assignIndex = ++k) {
						assignItem = assigns[assignIndex];
						if (assignItem != null) {
							if (assignItem.type === $.CJSX_WHITESPACE) {
								accumulatedWhitespace += this.serialiseNode(assignItem);
							} else {
								assignsWithWhitespace.push(accumulatedWhitespace + this.serialiseNode(assignItem));
								accumulatedWhitespace = '';
							}
						}
					}
					if (assignsWithWhitespace.length) {
						lastAssignWithWhitespace = assignsWithWhitespace.pop();
						trailingWhiteplace = accumulatedWhitespace.replace('\\\n', '\n');
						assignsWithWhitespace.push(lastAssignWithWhitespace + trailingWhiteplace);
					}
					joinedAssigns = joinList(assignsWithWhitespace);
					return "Object.assign(" + (joinList(assignsWithWhitespace)) + ")";
				};

				Serialiser.prototype.serialiseAttributePairs = function (children) {
					var child, childIndex, indexOfLastSemanticChild, isBeforeLastSemanticChild, ref1, semanticChildren, serialisedChild, serialisedChildren, whitespaceChildren;
					ref1 = children.reduce(function (partitionedChildren, child) {
						if (child.type === $.CJSX_WHITESPACE) {
							partitionedChildren[0].push(child);
						} else {
							partitionedChildren[1].push(child);
						}
						return partitionedChildren;
					}, [[], []]), whitespaceChildren = ref1[0], semanticChildren = ref1[1];
					indexOfLastSemanticChild = children.lastIndexOf(last(semanticChildren));
					isBeforeLastSemanticChild = function (childIndex) {
						return childIndex < indexOfLastSemanticChild;
					};
					if (semanticChildren.length) {
						serialisedChildren = (function () {
							var j, len, results;
							results = [];
							for (childIndex = j = 0, len = children.length; j < len; childIndex = ++j) {
								child = children[childIndex];
								serialisedChild = this.serialiseNode(child);
								if (child.type === $.CJSX_WHITESPACE) {
									if (containsNewlines(serialisedChild)) {
										if (isBeforeLastSemanticChild(childIndex)) {
											results.push(serialisedChild.replace('\n', ' \\\n'));
										} else {
											results.push(serialisedChild);
										}
									} else {
										results.push(null);
									}
								} else if (isBeforeLastSemanticChild(childIndex)) {
									results.push(serialisedChild + ', ');
								} else {
									results.push(serialisedChild);
								}
							}
							return results;
						}).call(this);
						return '{' + serialisedChildren.join('') + '}';
					} else {
						return null;
					}
				};

				return Serialiser;

			})();

			genericBranchSerialiser = function (node) {
				return node.children.map((function (_this) {
					return function (child) {
						return _this.serialiseNode(child);
					};
				})(this)).join('');
			};

			genericLeafSerialiser = function (node) {
				return node.value;
			};

			componentClassTagConvention = /(^[A-Z@]|\.)/;

			nodeSerialisers = {
				ROOT: genericBranchSerialiser,
				CJSX_PRAGMA: function () {
					return "`/** @jsx " + this.domObject + " */`";
				},
				CJSX_EL: function (node) {
					var accumulatedWhitespace, child, element, j, len, ref1, serialisedChild, serialisedChildren;
					serialisedChildren = [];
					accumulatedWhitespace = '';
					ref1 = node.children;
					for (j = 0, len = ref1.length; j < len; j++) {
						child = ref1[j];
						serialisedChild = this.serialiseNode(child);
						if (child != null) {
							if (serialisedChild.length === 0 || WHITESPACE_ONLY.test(serialisedChild)) {
								accumulatedWhitespace += serialisedChild;
							} else {
								serialisedChildren.push(accumulatedWhitespace + serialisedChild);
								accumulatedWhitespace = '';
							}
						}
					}
					if (serialisedChildren.length) {
						serialisedChildren[serialisedChildren.length - 1] += accumulatedWhitespace;
						accumulatedWhitespace = '';
					}
					if (componentClassTagConvention.test(node.value)) {
						element = node.value;
					} else {
						element = '"' + node.value + '"';
					}
					return this.reactObject + ".createElement(" + element + ", " + (joinList(serialisedChildren)) + ")";
				},
				CJSX_COMMENT: function (node) {
					return '';
				},
				CJSX_ESC: function (node) {
					var childrenSerialised;
					childrenSerialised = node.children.map((function (_this) {
						return function (child) {
							return _this.serialiseNode(child);
						};
					})(this)).join('');
					return '(' + childrenSerialised + ')';
				},
				CJSX_ATTRIBUTES: function (node) {
					if (node.children.some(function (child) {
							return child.type === $.CJSX_ATTR_SPREAD;
						})) {
						return this.serialiseSpreadAndPairAttributes(node.children);
					} else {
						return this.serialiseAttributePairs(node.children) || 'null';
					}
				},
				CJSX_ATTR_PAIR: function (node) {
					return node.children.map((function (_this) {
						return function (child) {
							return _this.serialiseNode(child);
						};
					})(this)).join(': ');
				},
				CJSX_ATTR_SPREAD: function (node) {
					return node.value;
				},
				CS: genericLeafSerialiser,
				CS_COMMENT: genericLeafSerialiser,
				CS_HEREDOC: genericLeafSerialiser,
				CS_STRING: genericLeafSerialiser,
				CS_REGEX: genericLeafSerialiser,
				CS_HEREGEX: genericLeafSerialiser,
				JS_ESC: genericLeafSerialiser,
				CJSX_WHITESPACE: genericLeafSerialiser,
				CJSX_TEXT: function (node) {
					var escapedText, leftSpace, leftTrim, rightSpace, rightTrim, text, trimmedText;
					text = node.value;
					if (containsNewlines(text)) {
						if (WHITESPACE_ONLY.test(text)) {
							return text;
						} else {
							leftSpace = text.match(TEXT_LEADING_WHITESPACE);
							rightSpace = text.match(TEXT_TRAILING_WHITESPACE);
							if (leftSpace) {
								leftTrim = text.indexOf('\n');
							} else {
								leftTrim = 0;
							}
							if (rightSpace) {
								rightTrim = text.lastIndexOf('\n') + 1;
							} else {
								rightTrim = text.length;
							}
							trimmedText = text.substring(leftTrim, rightTrim);
							escapedText = stringEscape(entityDecode(trimmedText), {
								preserveNewlines: true
							});
							return '"""' + escapedText + '"""';
						}
					} else {
						if (text === '') {
							return null;
						} else {
							return '"' + stringEscape(entityDecode(text)) + '"';
						}
					}
				},
				CJSX_ATTR_KEY: genericLeafSerialiser,
				CJSX_ATTR_VAL: genericLeafSerialiser
			};

			firstNonWhitespaceChild = function (children) {
				return find.call(children, function (child) {
					return child.type !== $.CJSX_WHITESPACE;
				});
			};

			containsNewlines = function (text) {
				return text.indexOf('\n') > -1;
			};

			joinList = function (items) {
				var i, output;
				output = items[items.length - 1];
				i = items.length - 2;
				while (i >= 0) {
					if (output.charAt(0) === '\n') {
						output = items[i] + ',' + output;
					} else {
						output = items[i] + ', ' + output;
					}
					i--;
				}
				return output;
			};

			SPACES_ONLY = /^\s+$/;

			WHITESPACE_ONLY = /^[\n\s]+$/;

			TEXT_LEADING_WHITESPACE = /^\s*?\n\s*/;

			TEXT_TRAILING_WHITESPACE = /\s*?\n\s*?$/;

			exports.Serialiser = Serialiser;

			exports.nodeSerialisers = nodeSerialisers;

		}, {"./entitydecode": 2, "./helpers": 3, "./stringescape": 6, "./symbols": 7}],
		6: [function (require, module, exports) {

			var hex = '0123456789abcdef'.split('');

			module.exports = function stringEncode(input, opts) {
				opts = opts || {};
				var escaped = "";

				for (var i = 0; i < input.length; i++) {
					escaped = escaped + encodeChar(input.charAt(i), opts.preserveNewlines);
				}

				return escaped;
			}

			function encodeChar(inputChar, preserveNewlines) {
				var character = inputChar.charAt(0);
				var characterCode = inputChar.charCodeAt(0);

				switch (character) {
					case '\n':
						if (!preserveNewlines) return "\\n";
						else return character;
					case '\r':
						if (!preserveNewlines) return "\\r";
						else return character;
					case '\'':
						return "\\'";
					case '"':
						return "\\\"";
					case '\&':
						return "\\&";
					case '\\':
						return "\\\\";
					case '\t':
						return "\\t";
					case '\b':
						return "\\b";
					case '\f':
						return "\\f";
					case '/':
						return "\\x2F";
					case '<':
						return "\\x3C";
					case '>':
						return "\\x3E";
				}

				return inputChar;
			}

		}, {}],
		7: [function (require, module, exports) {
// Generated by CoffeeScript 1.9.3
			module.exports = {
				ROOT: 'ROOT',
				CJSX_EL: 'CJSX_EL',
				CJSX_ESC: 'CJSX_ESC',
				CJSX_ATTRIBUTES: 'CJSX_ATTRIBUTES',
				CJSX_ATTR_PAIR: 'CJSX_ATTR_PAIR',
				CS: 'CS',
				CS_COMMENT: 'CS_COMMENT',
				CS_HEREDOC: 'CS_HEREDOC',
				CS_STRING: 'CS_STRING',
				CS_REGEX: 'CS_REGEX',
				CS_HEREGEX: 'CS_HEREGEX',
				JS_ESC: 'JS_ESC',
				CJSX_WHITESPACE: 'CJSX_WHITESPACE',
				CJSX_TEXT: 'CJSX_TEXT',
				CJSX_ATTR_KEY: 'CJSX_ATTR_KEY',
				CJSX_ATTR_VAL: 'CJSX_ATTR_VAL',
				CJSX_ATTR_SPREAD: 'CJSX_ATTR_SPREAD',
				CJSX_START: 'CJSX_START',
				CJSX_END: 'CJSX_END',
				CJSX_COMMENT: 'CJSX_COMMENT',
				CJSX_ESC_START: 'CJSX_ESC_START',
				CJSX_ESC_END: 'CJSX_ESC_END',
				CJSX_PRAGMA: 'CJSX_PRAGMA'
			};

		}, {}],
		8: [function (require, module, exports) {
// Generated by CoffeeScript 1.9.3
			var Parser, serialise;

			Parser = require('./parser');

			serialise = require('./serialiser');

			module.exports.transform = function (code, opts) {
				return serialise(new Parser().parse(code, opts));
			};

		}, {"./parser": 4, "./serialiser": 5}],
		9: [function (require, module, exports) {
// shim for using process in browser

			var process = module.exports = {};

			process.nextTick = (function () {
				var canSetImmediate = typeof window !== 'undefined'
					&& window.setImmediate;
				var canPost = typeof window !== 'undefined'
						&& window.postMessage && window.addEventListener
					;

				if (canSetImmediate) {
					return function (f) {
						return window.setImmediate(f)
					};
				}

				if (canPost) {
					var queue = [];
					window.addEventListener('message', function (ev) {
						var source = ev.source;
						if ((source === window || source === null) && ev.data === 'process-tick') {
							ev.stopPropagation();
							if (queue.length > 0) {
								var fn = queue.shift();
								fn();
							}
						}
					}, true);

					return function nextTick(fn) {
						queue.push(fn);
						window.postMessage('process-tick', '*');
					};
				}

				return function nextTick(fn) {
					setTimeout(fn, 0);
				};
			})();

			process.title = 'browser';
			process.browser = true;
			process.env = {};
			process.argv = [];

			function noop() {
			}

			process.on = noop;
			process.addListener = noop;
			process.once = noop;
			process.off = noop;
			process.removeListener = noop;
			process.removeAllListeners = noop;
			process.emit = noop;

			process.binding = function (name) {
				throw new Error('process.binding is not supported');
			}

// TODO(shtylman)
			process.cwd = function () {
				return '/'
			};
			process.chdir = function (dir) {
				throw new Error('process.chdir is not supported');
			};

		}, {}]
	}, {}, [1])(1)
});
//# sourceMappingURL=coffee-react.js.map

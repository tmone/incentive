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

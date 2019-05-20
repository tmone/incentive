// babel-transform.js
// babel 转换适配器

define('transpiler-babel', ['any', 'babel-standalone'], function(any, babel) {

    "use strict";

    var Base64 = any.Base64;

    var indexOf = function(array, item) {
        if (array.length <= 0)
            return -1;
        return array.indexOf(item);
    };

    var containsOrPush = function(array, item) {
        if (indexOf(array, item) < 0)
            array.push(item);
        return array;
    };

    var containsAndRemove = function(array, item) {
        var index = indexOf(array, item);
        if (index > -1)
            array.splice(index, 1);
        return array;
    };

    var prepareOptions = function(options, name, ext, url) {
        if (!any.isArray(options.presets))
            options.presets = [];
        // 确保转换为es2015，目前es6还不是普遍性实现，但相信很快就会得到普及了。
        containsOrPush(options.presets, 'es2015');

        if (ext === 'jsx')
            containsOrPush(options.presets, 'react');

        if (!any.isArray(options.plugins))
            options.plugins = [];

        // 应为考虑到代码是缓存的，所以我们生成sourceMaps，以方便调试
        options.sourceMaps = true;
        options.sourceMapTarget = name;
        options.sourceFileName = url;

        return options;
    };

    function transform(name, url, code) {
        var ext = any.getFileExt(name);
        var options = prepareOptions(any.getExtOptions(ext), name, ext, url);

        var result = {
            text: '',
            error: null
        };
        try {
            result = babel.transform(code, options);
            result.text = result.code;
            result.text += '\n//# sourceMappingURL=data:application/json;base64,' + Base64.encode(any.jsonEncode(result.map || {})) + '\n//# sourceURL=' + url;
        }
        catch (error) {
            result.error = error;
            if (any.isDebug)
                console.trace(error);
        }
        return result;
    }

    return {
        handle: function(name, req, load, config) {
            var date, dateInt, length = 0
				, ext = any.getFileExt(name)
				, url = req.toUrl(name)
                //>>debug<<
                , isDebug = any.isDebug
                , startDate = new Date()
                , debug = { src: 'cache', xhr: 0, handle: 0, lastModified: null, length: 0, url: url }
                ;

			any.xhr(url, {
				error: function(error) {
					load.error(error);
				},
				headers: function() {
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
				done: function() {
                    //>>debug<<
                    var tempDate = new Date();
                    if (isDebug) {
                        debug.src = 'update';
                        debug.xhr = any.diffDate(startDate) + 'ms';
                        debug.raw = this.response;
                    }
					var onCompile = function(result) {
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
					onCompile(transform(name, url, this.response));
				}
			});
        }
    }
});

//# sourceMappingURL=babel.js.map

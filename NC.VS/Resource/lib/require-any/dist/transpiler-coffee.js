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

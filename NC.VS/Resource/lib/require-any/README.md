# require-any

基于AMD（requirejs）机制，加载后现代的 javascript 近亲文件（如 coffee-script 、 react 、 ecmascript6 等），实时编译（转换）为 js，并将结果缓存在 HTML5 的 localStorage，并基于 AMD 机制进行加载。

取名 **any** 包含了 anytime 和 anything 的含义。

## 安装说明

目前分为3个分支：

1. master分支，包含了require-any、transpiler-babel、transpiler-coffee
2. babel分支，包含了require-any、transpiler-babel
3. coffee分支，包含了require-any、transpiler-coffee

3个分支的源代码部分都是一样的，唯一的区别是bower.json中 `main` 和 `dependencies` 的不同。

```shell
bower install require-any
// or 你只使用es6
bower install require-any#babel
// or 你只使用coffee
bower install require-any#coffee
```

核心的文件 `require-any.js` 实现如下内容：

1. 基于AMD的方式指定加载资源（基于XHR），如 `requirejs([any!test/Error.jsx])` 。
2. 实现了一个简单基于 HTML5 LocalStorage 的本地缓存的加载和比较的机制，用于对编译（翻译）完成的源代码（包含SourceMaps）进行缓存。
3. 实现了一个简易的XHR加载器（用于加载源代码）。
4. 一些辅助的基础函数。

本类库预设的实现了两个实时翻译器（ XHR 加载，并将翻译结果缓存在 LocalStorage ）：

1. coffee-transform，基于 coffee-script 官方类库进行编译。同时支持 **cjsx** 格式（coffee-script的jsx），基于[coffee-react-transform](https://github.com/jsdf/coffee-react-transform)。
2. babel-transform，基于[babel-standalone](https://github.com/Daniel15/babel-standalone)。目前实现对 ECMAScript6 、jsx 转换，ES6/ES7支持的特性请参考[Babel的官网说明](http://babeljs.io/)。

特别说明：由于coffee-react-transform没有指定bower.json文件，所以这个转译器的源代码会打包在coffee分支的代码中。

## 基本处理流程

基本的流程：

1. XHR发起请求源文件；
2. XHR的 **HEADERS_REVICES** 阶段去检查 localStorage 是否有该文件的缓存。
	* 有缓存，比较源文件的最后更新时间（**Last-Modified**）和文件长度（**Content-Length**）；
		* 相同，中断（abort）该次XHR，直接从缓存读取编译的结果；
		* 不相同，继续加载源文件，并编译，写入缓存；
	* 没有缓存，继续加载源文件，并编译，写入缓存；
3. 用AMD机制加载编译的结果。

## 实际项目使用说明

安装：

```shell
bower install require-any --save
```

修改针对require.js的配置：

```javascript
var rjsConfig = {
	paths  : {
    	'react'            : 'bower_components/react/react',
		'react-dom'        : 'bower_components/react/react-dom',
		'babel-standalone' : 'bower_components/babel-standalone/babel.min',
		'coffee-script'    : 'bower_components/coffee-script/extras/coffee-script',
		// 'coffee-react'     : 'src/transpiler/coffee-react',
		// 指定加载的协议，你可以指定任意名称
		'any'              : 'dist/require-any-all.min',
		// 下面转译器部分，如果你确定使用的名称为：transpiler-coffee 或 transpiler-babel，则不需要修改，已经包含在require-any-all的文件中。
		// coffee-script 对译器
		// 'transpiler-coffee': 'dist/require-any-all.min',
		// babel 对译器
		// 'transpiler-babel' : 'dist/require-any-all.min',
		// 对于指定路径的模块，也可以使用any!test2.es6的方式来加载，只能说AMD的规范真的做的很好。
		'test2'            : 'test/Test2'
	},
	// 注意，请在config下面注册配置，这是AMD规范的机制。
	// 
	config: {
		any: {
			// 指定缓存存储的空间
			cacheKey: 'my-cache',
			// 是否编译模式，如果是编译模式，则直接加载这个模块的js文件
			// any!test.jsx，当build = true，则会去加载 test.js 文件
			build: false,
			// 是否显示调试的信息
			// 调试改为支持等级的设置，> 1 的话，每次加载模块的名称，和url都会输出。
			debug: 2,
			// 声明相关的，插件
			plugins: {
				coffee: 'transpiler-coffee',
				es6: 'transpiler-babel'
			},
			// 增加一个模式的配置的设置
			// 模式匹配，最终还是去匹配文件后缀，来找到相关的编译参数。
			patterns: [
				{ regex: '.es6$', mode: 'i', onMatch: function(matches) {}, plugin: 'transpiler-babel' }
			],
			// 后缀文件名的别名，指定用哪个插件来进行处理
			ext: {
				cjsx: 'coffee',
				jsx: 'es6'
			},
			// 后缀转换（编译）时的参数，以后缀名为指向。
			// 如果这里指定了jsx，则优先取jsx的配置。
			// 如果没指定jsx，则会加载es6的配置。
			options: {
				es6: {
					plugins: [
						"transform-es2015-modules-amd",
						"transform-es2015-block-scoping",
						"transform-class-properties",
						"transform-es2015-computed-properties"
					]
				}
			}
		}
	}
	
};
rjsConfig.urlArgs = "version=" + (new Date()).valueOf();
requirejs.config(rjsConfig);
```

## 代码使用

可以参考 `index.html`

```javascript
requirejs(['any!test/hello.coffee', 'any!test/Table.cjsx', 'react', 'react-dom', 'any!test/Test.jsx', 'any!test/Error.jsx'], function(hello, Table, React, ReactDOM, Test, Error) {
	ReactDOM.render(React.createElement(Table), document.getElementById('test1'));
	ReactDOM.render(React.createElement(Test), document.getElementById('test2'));
});
```

上述中，如果 `config.any.build` 为 `true` 的话，所有any前缀请求都会去掉相应的后缀文件名，即加载这个模块的js文件。如：test/hello.js。

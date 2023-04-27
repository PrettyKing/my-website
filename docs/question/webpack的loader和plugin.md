---
title: webpack 的loader和plugin
date: 2021-07-12
tags:
 - question
categories:
 - 问题积累
---

## loader&plugin

### loader

loader是文件加载器，能够加载资源文件，并对这些文件迸行一些处理，例如编译、圧縮等，最終一起起打包到指定的文件中，处理一个文件 可以使用多loader, loader的执行順序和配置中的順序是相反的，即最后一个loader最先执行，第一个loader最后执行，第一个执行的loader接收源文件内容作为参数，其它loader接收前一个执行的loader的返回值作为参数，最后执行的loader 会返回此模快的JavaScript源码。

編写自己的loader肘需要引用官方提供的laoder-utils，調用loaderUtils.getOptions(this )拿到webpack的配置参数，然后迸行自己的处理。

Loader本身仅仅只是一个函数， 接收模快代码的内容，然后返回代碍内容装化后的結果，并且一个文件逐可以链式的经过多个loader转化(比如scss -loader => css -loader => style-loader)。

一个Loader 的职责是单一的， 只需要完成一种转化。 如果一个源文件需要経万多歩装化オ能正常使用，就通辻多个Loader 去装化。 在調用多个Loader 去转化一个文件时，毎个Loader 会鏈式的順序执行， 第一个Loader 將会拿到需处理的原内容， 上一个Loader赴理后的結果会侍給下一个接着赴理，最后的Loader 將処理后的最終結果返回給Webpack。

一个最筒単的loader例子:

```js
module.exports = function(source) {
  // source 为 compiler 传递给 Loader 的一个文件的原内容
  // 该函数需要返回处理后的内容，这里简单起见，直接把原内容返回了，相当于该 Loader 没有做任何转换
  return source;
};
```

### plugin

plugin功能更强大，Loader不能做的都是它做。它的功能要更加丰富。从打包优化和压缩，到重新定义环境变量，功能强大到可以用来处理各种各样的任务。

pluginiwebpack的机制更加灵活，它在编译过程中留下的一系列生命周期的钩子，通过调用这些钩子来实现在不同编译结果时对源模块进行处理。它的编译是基于事件流来编译的，主要通过taptable来实现插件的绑定和执行的，taptable主 要是基于发布订阅执行的插件架构，是用来创建声明周期钩子的库。调用complier . hooks .run.tap开始注册，创建compilation,基于配置创建chunks,在通过parser解析chunks,使用模快和依赖管理模块之间的依赖关系，最后使用template基 于compilation数据生成结果代码。

plugin的实现可以是一个类， 使用时传入相关配置来创建一个实例， 然后放到配置的plugins字段中，而plugin 实例中最重要的方法是 apply，该方法在 webpack compiler安装插件时会被调用一次，apply 接收webpack compiler 对象实例的引用，你可以在compiler 对象实例上注册各种事件钩子函数，来影响webpack的所有构建流程，以便完成更多其他的构建任务。

一个最简单的plugin例子:

```js
class BasicPlugin{
  // 在构造函数中获取用户给该插件传入的配置
  constructor(options){
  }

  // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply(compiler){
    compiler.plugin('compilation',function(compilation) {
    })
  }
}

// 导出 Plugin
module.exports = BasicPlugin;
```

Webpack启动后，在读取配置的过程中会先执行new BasicPlugi(options) 初始化一个BasicPlugin 获得其实例。在初始化 compiler 对象后，再调用basicPlugin.apply(compiler)给插件实例传入compiler 对象。插件 实例在获取到compiler 对象后，就可以通过compiler . plugin(事件名称，回调函数)监听到Webpack广播出来的事件。并且可以通过compiler 对象去操作Webpack。

开发Plugin 最主要的就是理解compiler 和compilation, 它们是Plugin 和Webpack之间的桥梁。这两者提供的各种hooks 和api, 则是开发plugin所必不可少的材料，通过compiler 和compilation 的生命周期hooks; 也可以更好地深入了解webpack的整个构建工作是如何进行的。



## 常见的loader&plugin

### 常见的loader

1. file-loader:文件加载
2. url-loader: 文件加载，可以设置阈值，小于时把文件base64编码
3. image -loader:加载并压缩图片
4. json-loader: webpack默认包含了
5. babel-loader: ES6+转成ES5
6. ts -loader:将ts转成js
7. awesome -typescript-loader: 比上面那个性能好
8. css-loader: 处理@import和uri这样的外部资源
9. style -loader:在head创建style标签把样式插入; 
10. postcss-loader:扩展css语法，使用postcss各种插件autoprefixer, cssnext, cssnano
11. eslint-loader ,tslint -loader :通过这两种检查代码，tslint不再维护， 用的eslint
12. vue -loader:加载vue单文件组件
13. i18n-loader: 国际化
14. cache -loader:性能开销大的loader前添加，将结果缓存到磁盘;
15. svg -inline -loader:压缩后的svg注入代码;
16. source -map-loader:加载source Map文件，方便调试;
17. expose -loader:暴路对象为全局变量
18. imports -loader、exports -loader等可以向模块注入变量或者提供导出模块功能
19. raw-loader可以将 文件已字符串的形式返回
20. 校验测试: mocha-loader、 jshint-loader 、eslint-loader等

### 常见的plugin

- ignore plugin:忽略文件
- uglifyis -webpack-plugin: 不支持ES6压缩(Webpack4 以前使用)
- terser-webpack-plugin:支持压缩ES6 (Webpack4)
- webpack pal-uglify-plugin:多进程执行代码压缩，提升构建速度
- mini-css extract-plugin:分离样式文件，CSS提取为独立文件，支持按需加载
- serviceworker -webpack -plugin:为网页应用增加离线缓存功能
- clean-webpack-plugin:目录清理
- speed-measure -webpack-plugin:可以看到每个Loader 和Plugin 执行耗时
- webpack内置UglifyJsPlugin,压缩和混淆代码。
- webpack内置CommonsChunkPlugin,提高打包效率，将第三方库和业务代码分开打包。
- ProvidePlugin:自动加载模块，代替require和import
- html-webpack : plugin可以根据模板自动生成html代码，并自动引用css和js文件
- extract-text-webpack-plugin将js文件中引用的样式单独抽离成css文件
- DefinePlugin编译时配置全局变量，这对开发模式和发布模式的构建允许不同的行为非常有
- HotModuleReplacementPlugin热更新
- DllPlugin和DIIReferencePlugin相互配合，前者第三方包的构建，只构建业务代码，同时能解决Externals多次用问题。DlIReferencePlugin引用DIIPlugin配置生 成的manifest.json文件。

### 依赖模块和module ID的关系

- optimize -css-assets -webpack -plugin不同组件中重复的css可以快速去重
- webpack- bundle -analyzer一个webpack的bundle文件分析工具，将bundle文件以可交 互缩放的treemap的形式展示。
- compression-webpack plugin生产环境可采用gzip压缩JS和CSS
- happypack:通过多进程模型，来加速代码构建
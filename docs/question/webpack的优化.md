---
title: webpack 及其优化
date: 2021-07-02
tags:
 - question
categories:
 - 问题积累
---

> ### 什么是webpack？
>
> webpack是个打包模 快化JavaScript的工具， 它将切文件 都视为模块， 通过loader编译转换文件， 通过plugin注入钩子，最后将输出的资源模块组合 成文件。它主要的配置信息有entry、output、 modules、 plugins. 

## 1)优化Webpack的构建速度

- 使用高版本的Webpack (使 用webpack4)
- 多线程/多实例构建: HappyPack(不维护 了)、thread-loader
- 缩小打包作用域:
	- exclude/include (确定loader 规则范围)
	- resolve .modules指明第三方模块的绝对路径(减少不必要的查找)
	- resolve . extensions尽可能减少后缀尝试的可能性
	- noParse 对完全不需要解析的库进行忽略(不去解析但仍会打包到bundle 中，注意被忽略掉的文件里不应该包含import、 require、 define 等模块化语句)
	- lgnorePlugin (完全排除模块)
	- 合理使用alias
- 充分利用缓存提升二次构建速度;
	- babel-loader 开启缓存
	- terser-webpack -plugin开启缓存
	- 使用cache -loader或者hard-source -webpack -plugin
	注意: thread-loader和cache-loader 兩個要一起使用的話， 請先放cache -loader接著是thread -loader最後才是heavy -loader 
-  DLL :
	- 使用 DIIPlugin 进行分包，使用DIIReferencePlugin(索引链接) 对manifest.json 引用，让一些基本不会改动的代码先打包成静态资源，避免反复编译浪 费时间。
## 2)使用webpack4.优化及原因
- (a)V8带来的优化(for of替代forEach、 Map和Set替代Object、 includes替代indexOf)
- (b)默认使用更快的md4 hash算法
-	(c)webpacks AST可以直接从loader传递给AST,减少解析时间
-	(d)使用字符串方法替代正则表达式

### ① noParse
- 不去解析某个库内部的依赖关系
- 比如jquery 这个库是独立的，则不 去解析这个库内部依赖的其他的东西
	在独立库的时候可以使用

```js
module.exports = {
  module: {
    noParse: /jquery/,
    rules:[]
  }
}
```
### ②lgnorePlugin
- 忽略掉某些内容不去解析依赖库内部引用的某些内容
- 从moment中引用. /ocol则忽略掉
- 如果要用local的话则必须在项目中必须手动引入

``` js
import 'moment/locale/zh-cn
module.exports = { plugins: [ new Webpack. ignorePlugin(/. /local/, /moment/), ] }
```
### ③dilPlugin
- 不会多次打包，
- 优化打包时间
- 先把依赖的不变的库打包
- 生成manifest.json文件
- 然后在webpack.config中引入
- webpack. DIPlugin Webpack . lIReferencePlugin
### ④happypack -> thread-loader
- 大项目的时候开启多线程打包
- 影响前端发布速度的有两个方面，一个是构建，-个就是压缩，把这两个东西优化起来，可以减少很多发布的时间。
### ⑤thread-loader 
thread-loader 会将您的loader 放置在一个worker 池里面运行，以达到多线程构建。把这个 loader 放置在其他loader之前(如下图example 的位置)，放置在这个loader 之后的loader 就会在-个单独的worker 池(worker pool)中运行。
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: [
          "thread-loader",
          // 你的高开销的loader放置在此 (e.g babel-loader)
        ]
      }
    ]
  }
}
```
每个worker都是一个 单独的有600ms限制的node.js 进程。同时跨进程的数据交换也会被限制。请在高开销的loader中使用， 否则效果不佳
### ⑥压缩加速一开启 多线程压缩
- 不推荐使用webpack-paralle uglify-plugin,项目基本处于没人维护的阶段，issue 没人处理，pr没人合并。
Webpack 4.0以前：uglifyjs-webpack-plugin,parallel参数
```js
module.exports = {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
      }),
    ],
  },};
```
-  推荐使用terser-webpack-plugin

```js
module.exports = {
  optimization: {
    minimizer: [new TerserPlugin(
      parallel: true   // 多线程
    )],
  },
};
```

## 3)优化Webpack的打包体积
- 压缩代码
	- webpack paralle-uglify -plugin
	- uglifyjs -webpack-plugin 开启parallel 参数(不支持ES6)
	- terser -webpack-plugin 开启parallel 参数
	- 多进程并行压缩
	- 通过mini-css -extract-plugin 提取Chunk 中的CSS代码到单独文件，通过optimize -CSS -assets -	-		- webpack -plugin插件 开启cssnano 压缩CSS.
- 提取页面公共资源:
	- 使用html-webpack . externals-plugin, 将基础包通过CDN引入，不打入bundle中
	- 使用SplitChunksPlugin 进行(公共脚本、基础包、页面公共文件)分离(Webpack4内置) ，替代了CommonsChunkPlugin 插件
	- 基础包分离:将些基础库放到cdn, 比如vue, webpack 配置external是的vue不打入bundle
- Tree shaking
	- purgecss-webpack-plugin 和mini-Css -extract- plugin配合使用(建议)
	- 打包过程中检测工程中没有引用过的模块并进行标记，在资源压缩时将它们从最终的bundle中去掉(只能对ES6 Modlue生效) 开发中尽可能使用ES6 Module的模块，提高tree shaking效率
	- 禁用babel-loader 的模块依赖解析，否则Webpack接收到的就都是转换过的CommonJS形式的模块，无法进行tree -shaking
	- 使用PurifyCSS(不在维护) 或者uncss 去除无用CSS代码
- Scope hoisting
	- 构建后的代码会存在大量闭包，造成体积增大，运行代码时创建的函数作用域变多，内存开销变大。Scope hoisting 将所有模块的代码按照引用顺序放在一个图数作用域里，然后适当的重命名-些变量以防止变量名冲突
	- 必须是ES6的语法，因为有很多第三方库仍采用CommonJS语法，为了充分发挥Scope hoisting 的作用，需要配置mainFields 对第三方模块优先采用jsnext:main中指向的ES6模块化语法
- 图片压缩
	- 使用基于Node库的imagemin (很多定制选项、可以处理多种图片格式)
	- 配置image -webpack -loader
- 动态Polyfill
	- 建议采用polill-service 只给用户返回需要的polylill, 社区维护。(部分国内奇葩浏览器UA可能无法识别，但可以降级返回所需全部poyil)
	- @babel-preset-env 中通过useBuiltIns: 'usage参数来动态加载plyill。
## 4) speed-measure-webpack-plugin 
简称SMP,分析出Webpack打包过程中Loader 和Plugin 的耗时，有助于找到构建过程中的性能瓶颈。

## 5)构建流程

### 基础概念
1. `Compiler:` Webpack的运行入口，实例化时定义webpack构建主要流程，同时创建构建时使用的核心对象compilation
2. `Compilation: `由Compiler实例化， 存储构建过程中流程使用到的数据，用于控制这些数据的变化，每次构建创建一 个Compilation实例
3. `Chunk: `一般一个入口对应一个Chunk
4. `Module: `用于表示代码模块的类型，有很多子类用于处理不同情况的模块，模块相关信息都可以从Module实例中获取，例如dependiencies记录模块的依赖信 息
5. `Parser: `基于acorn来分析AST语法树， 解析出代码模块的依赖
6. `Dependency:` 解析时用于保存代码模块对应的依赖使用的对象
7. `Template:` 生成最终代码要使用到的代码模块

### 基本流程
1. 创建Compiler实例， 用于控制构建流程，compiler实例包含webpack基本环境信息
2. 根据配置 项转换成对应内部插件，并初始化options配置项
3. 执行compiler.run
4. 创建Compitation实例， 每次构建都会新创建一个Compliation实例， 包含了这次构建的基本信息
5. 从entry开始递归分析依赖， 对每个依赖模块进行buildModule,通过L .oader将不同类型的模块转换成Webpack模块
6. 调用Parser .parse将上面的结果转换成AST树
7. 遍历AST树，收集依赖Dependency, 并保存在Compliation实例的dependiencies属性中
8. 生成Chunks, 不同entry生 成不同chunk,动态导入也会生成自己的chunk,生成chunk后还会进行优化
9. 使用Template基 于Compilation的数据生成结果代码

### 编译过程
- `第一步`先初始化参数，通过yargs 将webpack . config .js和hel脚本的配置信息合并，进行参数的初始化;
- `第二步`利用初始化的参数创建complier对象，complier可以视为一个webpack的实例， 存在于webpack从启动到结束的整个过程，它包含了webpack的module、plugin等 参数信息，然后调用complier .run方法开始编译。
- `第三步`根据entry配置信息找到入口文件，创建compilation对象， 可以理解为webpack-次编译的过程，包含了当前编译环境的所有资源，包括编译后的文件。
- `第四步`通过配置信息，调用loader进行模块翻译， 使用acorn将 模块转换为AST,当遇到require依赖时， 创建依赖并加入依赖数组，再找出依赖的依赖，递归异步的处理所有的依赖。
- `第五步`完成第四步后将得到所有模块的依赖关系和模块翻译后的文件，然后调用compilation.seal方法， 对这些模块和根据模块依赖关系创建的chunk进行整理，将所有资源进行合并拆分等操作。这
是最后次能修改输出内容的地方 。
- `第六步`根据配置信息中的output配置，进行最后模块的文件输出，指定输出文件名和文件路径。

### 原理

webpack打包输出后的文件其实就是一一个闭包， 传入的参数是一个对象， 键值为所有输出文件的路径，内容为eval包裹的文件内容;闭包内重写了模块的加载方式，自己定义了`__webpack.require_` 方法，来实现模拟的commonjs规范模块加载机制。

Webpack实际上是基于事件流的，通过系列的插件 来运行。Webpack利用tapable库提供各种钩子来实现对于整个构建流程各个步骤的控制。

## 持久化缓存

- 服务端设置HTTP缓存头(Cache-Control等)
- 打包依赖(dependencies) 和运行时(runtime) 到不同chunk (在 webpack中，编译后的单独文件称为chunk)，即作splitChunks, 因为它们几乎是不变的。
- 延迟加载:使用import() 方式， 可以将动态加载的文件分到独立的chunk, 以得到自己的chunkhash
- 保证hash值稳定:编译过程和文件内容的更改尽量不影响其他文件hash的计算。对于低版本webpack生成的增量数字ID 不稳定问题，可用HashedModuleIdsPlugin 基于 文件路径生成解决。

##   Webpack做了什么
1. webpack本质上只是一个js引用程序的静态打包器，他能够基于文件的依赖，递归的构建-一个文件依赖关系图，最终将文件打包成为一个或者多个bundle; 
2. webpack基 于entry识别那个/哪些模块是构建打包的入口;
3. webpack基于output, 将构建打包的文件输出到指定的目录;
4. 从入口文件出发 ，调用所有配置的Loader 对模块进行翻译，再找出该模块依赖的模块,再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
5. 经过Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk,再把每个Chunk 转换成一个单独的文件加入到输出列表

##  webpack构建时有无做- 些自定义操作做的一些自定义操作
1. alias: 指定别名，能在一 定程度上降低开发对文件路径的输入难度，缓存路径能些微提升打包速度;
2. module对loader处理添加fallback, 能在loader处理中，依次进行指定的预处理或后处理，自定义loader组件也可以在此进行特殊替换;
3. optimization - splitChunks - cacheGroups 自定义打包中的性能优化部分，对共用模块的拆分，识别以及提取后的指定工作;
4. 自定 义的plugins配置: CopyWebpackPlugin对静态 文件的拷贝，ProgressBarPlugin打 包进度的监控, HappyPack多线程打包等等;
5. stats调整打 包过程中控制台的输出，详细到每个文件的大小，耗时及打包状态(warning)等各种显示优化;
5. devServer ”before: 添加打包前的优化，可以实现较为简洁的mock数据



## webpack的整个生命周期

Webpack的运行流程是一个串行的过程，从启动到结束会依次执行以下流程
- `初始化参数`从配置文件和Shell 语句中读取与合并参数，得出最终的参数
- `开始编译`用上一步得到的参数初始化Compiler 对象，加载所有配置的插件，执行对象的run方法开始执行编译
- `确定入口`根据配置中的entry 找出所有的入口文件
- `编译模块`从入口文件出发，调用所有配置的Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
- `完成模块编译`在经过第4步使用Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
- `输出资源`根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk,再把每个Chunk转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
- `输出完成`在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在以上过程中，Webpack会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用Webpack提供的API改变Webpack的运行结果。


---
title: dev-server 是怎么跑起来的
date: 2021-07-10
tags:
 - question
categories:
 - 问题积累
---



### dev-server运行配置
- 安装webpack-dev- server的npm包
- 在webpack . config .js中进行配置

`devServer中常用的配置对象属性如下:`

1. contentBase: ”./”,本地服务器在哪个目录搭建页面，一般在当前目录即可;
2. historyApiFallback: true， 搭建spa应用时有用，它使用的是HTMLS History Api,任意的跳转或404响应可以指向index .html页面;
3. inline: true ,用来支 持dev-server自动刷新的配置，webpack有 两种模式支持自动刷新，- 种是iframe模式，-种是inline模式;使用iframe模式是 不需要在devServer进行配置的，只需使用特定的URL格式访问即可;不过我们一般还是常用inline模式，在devServer中对inline设 置为true后，当启动webpack -dev-server时仍要需要配置inline才能生效
4. hot: true， 启动webpack热模块替换特性
5. port，端口号(默认8080)

### 怎么跑起来的
1. 启动HTTP服务
2. Webpack构建 输出Bundle到内存，HTTP服务从内存中读取Bundle文件
3. 监听文件变化，重新执行第二个步骤

dev-server实际上是一个HTTP服务 器，所以还可以做静态资源的访问和API的Proxy代码

- 静态资源的访问

   ```js
   {
       devServer: {
           contentBase: 'public'
       }
   }
   ```

- Proxy代理

   ```js
   {
       devServer: {
           proxy: {
               '/api': {
                   target: 'http://api.target.com/'
               }
           }
       }
   }
   ```

   

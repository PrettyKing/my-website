---
title: 性能优化(三)
date: 2021-05-12
author: 卫辰
---

## 资源优化

### html压缩

- 使用在线工具 [html-minifier](http://kangax.github.io/html-minifier/)进行压缩
- 使用 npm 包进行压缩 [html-minifier]

  ```js
  var fs = require('fs');
  var minify = require('html-minifier').minify;
  fs.readFile('./test.htm', 'utf8', function (err, data) {
      if (err) {
          throw err;
      }
      fs.writeFile('./test_result.html', minify(data,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true}),function(){
          console.log('success');
      });
  });
  //如上安装 npm 后使用Node 读取文件后进行压缩再写入文件
  ```

### css压缩

- [在线工具](https://jakubpawlowicz.github.io/clean-css/)压缩
- 使用 **clean-css** [npm](https://github.com/jakubpawlowicz/clean-css)包进行压缩

CSS JS资源合并,在合并前应该考虑是否会影响别的文件,合理的选择,单个JS文件大小在 **30Kb为最佳**。

### 图片优化

在线压缩 [imagemin](https://imagemin.saasify.sh/)经个人测试[原图](https://lilixikun.github.io/optimization/LightHouse.png)**192KB** 压缩后只有 **52.7KB**,可以看到体积都是大大的缩小。

- JPEG：**有损压缩、体积小、加载快、不支持透明**

  > JPEG/JPG 采用特殊的有损压缩算法，将不易被人眼察觉的图像颜色删除，从而达到较大的压缩比，因此它的压缩文件尺寸较小，下载速度快，成为互联网最广泛使用的格式。
  >
  > 在合适的场景下，即便我们将图片体积压缩至原有体积的 **50%** 以下,JPG 仍能保持住 **60%** 的品质.当压缩级别逐渐增大的时候，图片质量会逐渐损耗，所以压缩要适当。

  - **使用场景**
    1. 大的背景图
    2. 轮播图
    3. Banner 图
  - 使用 [imagemin-jpegtran](https://www.npmjs.com/package/imagemin-jpegtran)进行 JPG 压缩

- PNG:**无损压缩、质量高、体积大、支持透明**

  > PNG（可移植网络图形格式）是一种无损压缩的高保真的图片格式，它的压缩比高于 GIF，支持图像透明，可以利用 Alpha 通道调节图像透的明度。

  - **使用场景**

    1. 小的 Logo，颜色简单且对比强烈的图片或者背景
    2. 颜色简单、对比度强的透明小图。

    使用[imagemin-pngquant](https://github.com/imagemin/imagemin-pngquant)进行 PNG 的压缩

- GIF:支持动画,格式的压缩率一般在 **50%** 左右。

- SVG:**文本文件、体积小、不失真、兼容性好**

  > **SVG** 格式的图片可以任意放大图形显示，并且不会损失图片质量

  - **适用场景**

    1. SVG loading 效果图：SVG-Loaders
    2. 矢量图标库：阿里巴巴矢量图标

    使用 [imagemin-svgo](https://github.com/imagemin/imagemin-svgo)进行 svg 压缩

- WebP:支持有损压缩和无损压,但兼容性不够好,在特定使用场景下再去考虑它.

  使用[imagemin-webp](https://github.com/imagemin/imagemin-webp)进行 PNG 的压缩

#### 图片的其他优化：

- 懒加载

  在可视化的窗口中才去加载图片,大大提高首次的渲染速度!

  - 原生支持 加 loading 属性 就可以了 需要浏览器支持
  - 第三方插件 [lazyload](https://github.com/tuupola/lazyload),[react-lazyload(opens new window)](https://github.com/twobin/react-lazyload)
  
- 使用渐进式图片

  > 渐进式图片渲染过程中，会先显示整个图片的模糊轮廓，随着扫描次数的增加，图片变得越来越清晰。在如果图片较大或者网速慢的情况可以使用,提升用户的体验,不至于图片没有加载出来的部分呈现一片空白，不利于体验。

  可以使用 [progressive-image](https://github.com/ccforward/progressive-image)插件来帮我们解决

- 使用响应式图片

  - Srcset 属性的使用

  - Sizes 属性的使用

  - picuure的使用

  - 如下使用非常简单

    ```html
    <img srcset="foo-160.jpg 160w,
                 foo-320.jpg 320w,
                 foo-640.jpg 640w,
                 foo-1280.jpg 1280w"
         src="foo-1280.jpg">
    ```

    具体可以参照 阮一峰老师的 [响应式图像教程](http://www.ruanyifeng.com/blog/2019/06/responsive-images.html?utm_source=tuicool&utm_medium=referral)

### 字体优化

开发者可以在自己的项目中使用自定义的字体,而下载时间难免会受到网络状况的影响从而会导致页面抖动的情况.因此 **@font-face**增加新的 **font-display** 声明，用于控制字体下载完成之前的渲染行为。使用如下:

```css
@font-face {
 font-family: 'Arvo';
 font-display: auto;
 src: local('Arvo'), url(https://fonts.gstatic.com/s/arvo/v9/rC7kKhY-eUDY-ucISTIf5PesZW2xOQ-xsNqO47m55DA.woff2) format('woff2');
}
```

**font-display** 有下面几种属性:

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-11-140643.png)

可以加载有限的字符集多个,那样会在需要时才去下载,如下:

```css
@font-face{
    ...
}
@font-face{
    ...
}
@font-face{
    ...
}
```

## 传输优化

### 启动压缩 Gzip

在 修改 Nginx 配置,启动**Gzip**压缩

```js
gzip                on;
```

### Keep-Alive

**Keep-Alive** 在Http1.1 默认是开启的,可以在 Response Header 中可以看到 **Connection: keep-alive**

在nginx 配置中有两个比较重要的配置

```js
keepalive_timeout 65  // 保持连接的时间，也叫超时时间，单位秒
keepalive_request 100 // 最大连接上限 
```

### Http缓存

详情请见[HTTP缓存](http://wei-chens-blog.gitee.io/vuepress-reco-blog/docs/yd-log/http.html)

### Service Workers

TODO

### Http2

- 二进制传输
- 请求相应多路复用
- Server push

在 Nginx 开启 Htpps,配置证书,可以参考 [生成自签名的SSL证书和私钥(opens new window)](https://www.cnblogs.com/007sx/p/12583675.html)

修改配置

```js
server {
	# 添加 http2
	listen 443 ssl http2;
	...
}
```

### SSR

TODO

### 资源加载顺序

- preload：**Preload** 来告诉浏览器预先请求当前页需要的资源，从而提高这些资源的请求优先级。比如,对于那些本来请求优先级较低的关键请求,我们可以通过设置 **Preload** 来提升这些请求的优先级。合理的安排优先级可以提升网站的性能,比如我们可以优先字体资源的下载。
- **Prefetch**：**Prefetch** 来告诉浏览器用户将来可能在其他页面(非本页面)可能使用到的资源,那么浏览器会在空闲时,就去预先加载这些资源放在 http 缓存,最常见的 **dns-prefetch**.

> 从加载优先级上看,**Preload** 会提升请求优先级;而**Prefetch**会把资源的优先级放在最低，当浏览器空闲时才去预加载。

## 优化究极

::: danger 为什么要性能优化？

- 57%的用户更在乎网页 3秒 内是否加载完成
- 52%的在线用户认为网⻚打开速度影响 到他们对网站的忠实度
- 每慢1秒造成⻚面 PV 降低11%，用户满意度也随之降低降低16%。
- 近半数移动用户因为在10秒内仍未打开⻚面从而放弃。

:::

::: danger 

PV 即页面浏览量或点击量，是衡量一个网站或网页用户访问量。具体的说，PV 值就是所有访问者在 24 小时（0 点到 24 点）内看了某个网站多少个页面或某个网页多少次。PV 是指页面刷新的次数，每一次页面刷新，就算做一次 PV 流量。度量方法就是从浏览器发出一个对网络服务器的请求（Request），网络服务器接到这个请求后，会将该请求对应的一个网页（Page）发送给浏览器，从而产生了一个 PV。

:::

### 雅虎军规

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-11-141803.png)

- 浏览器正常并发请求**5个**左右,大小100kb左右,压缩后 **30kb**
- 使用CND,CDN不会携带多余的 cookie,使用多个CDN，解决浏览器对同一个域名的并发
- Http2 多路复用 Keep-Alives

参考 [虎牙军规](https://www.jianshu.com/p/4cbcd202a591)

### 缓存策略

详情请见[HTTP缓存](http://wei-chens-blog.gitee.io/vuepress-reco-blog/docs/yd-log/http.html)

### 网站协议

通过升级http 协议

**HTTP2多路复用**

浏览器请求//xx.cn/a.js-->解析域名—>HTTP连接—>服务器处理文件—>返回数据-->浏览器解析、渲染文件

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-11-142020.png)

**Keep-Alive** 解决的核心问题就在此，一定时间内，同一域名多次请求数据，只建立一次HTTP请求，其他请求可复用每一次建立的连接通道，以达到提高请求 效率的问题。一定时间是可以配置的.

HTTP1.1还是存在效率问题，

1. 第一个:串行的文件传输。
2. 第二个:连接数过多。

HTTP/2对同一 域名下所有请求都是基于流,也就是说同一域名不管访问多少文件,也只建立一路连接。同样Apache的最大连接数为300,因为有了 这个新特性，最大的并发就可以提升到300，比原来提升了 **60** 倍

###  小字为先

通过分析工具，哪里大, 对那块进行压缩优化调优，尽量小 一般单个文件压缩后为 **30KB** 最佳。

### 白屏原因

主要分为

- css,js 文件获取 阻塞
- js 文件解析
- dom 生成
- cssom 生成

优化调优

- 骨架屏
- 组件预加载
- 配合PWA缓存

### 优化技巧

- 预渲染：如果觉得 **SSR** 或者同构方案成本太大,可以考虑使用 **预渲染**,使用也是非常简单 [react-snap](https://github.com/stereobooster/react-snap)
- windowing：在遇到大量的列表渲染时,我们可以使用窗口化技术,在一定的区域内只显示一定的DOM元素,提高列表性能。 比较成熟的有 **React-virtualized** ,这里强烈推荐 [react-window](https://github.com/bvaughn/react-window),配合 [AutoSize](https://github.com/jackmoore/autosize)谁用谁知道吧。
- 使用骨架组件：骨架屏可以理解为是当数据还未加载进来前，页面的一个空白版本，使用骨架屏进行预先的占位,降低了用户的焦躁情绪，使得加载过程主观上变得流畅。在这里推荐使用 [react-placehold](https://github.com/buildo/react-placeholder),也可以按照自己的布局进行自定义。



### 总结：

优化主要从以下几个点出发:

1. [虎牙军规]
2. [资源优化]
3. [传输加载优化]
4. [页面缓存]
5. [MPA渲染]
6. [性能分析]


---
title: 性能优化(一)
date: 2021-05-10
author: 卫辰
---

## 浏览器加载页面过程

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-142306.png)

## Chrome的一些有关性能的插件

### **LightHouse**

> 安装完成之后，打开面板发现新加一个 **Lifhhouse**的项,点击 **Generate report** 会给我们生成性能报告,并提出一些能够优化的建议。

::: tip 一个类似的npm包

-  安装

  ```shell
  npm install -g lighthouse
  ```

- 使用

  ```js
  lighthouse http://faithcal.com
  ```

  更详细的请参考 [lighthouse](https://github.com/GoogleChrome/lighthouse)

:::

### PageSpeed

> 安装完成之后，选择 PageSpeed Insights (with PNaCl) 添加至 Chrome 即可。打开控制面板会发现新加一个 **PageSpeed** 的项,点击 **START ANALYZING** 会列出我们可以优化的点。

### Timeline
网页动画能够做到每秒 **60** 帧,就会跟显示器同步刷新,一秒之内进行 **60** 次重新渲染,每秒重新渲染的时间 不能超过 **16.66** 毫秒

- 蓝色:网络通信和 HTML 解析
- 黄色:JavaScript 执行时间
- 紫色:样式计算和布局,即重排
- 绿色:重绘

**window.requestAnimationFrame** 下一次渲染

**window.requestIdleCallback** 下几次渲染

::: tip 其他

[webpagetest ](https://www.webpagetest.org/)是一款前端性能分析工具,可以在线测试,也可以独立搭建本地服务器. 多测试地点、全面性能报告。

:::

## Chrome一些关于性能的API

### PerformanceObserver

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>获取各种指标</title>
    <link rel="stylesheet"
        href="https://cdn.staticfile.org/twitter-bootstrap/5.0.0-alpha1/css/bootstrap-reboot.min.css" />
</head>

<body>
    <div id="app">
        <h1>aotu</h1>
    </div>

    <script>
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log(entry.name);
                console.log(entry.startTime);
                console.log(entry.duration);
                console.log(entry.entryType);
            }
        });
        observer.observe({ entryTypes: ['paint', 'resource', 'mark'] });
    </script>
    <script>
        performance.mark('xikun')
    </script>
</body>
</html>
```

**entryTypes** 有如下几种:

| 属性              |                            含义                             |
| ----------------- | :---------------------------------------------------------: |
| mark              |                   通过 performance.mark()                   |
| measure           |                 通过 performance.measure()                  |
| resource          |                          资源时间                           |
| frame, navigation |                         文件的地址                          |
| paint             | 获取绘制的时间,主要是 first-paint 和 first-contentful-paint |
| longtask          |                在浏览器执行超过 50ms 的任务                 |

使用框架 **web-vitals**

可以通过 npm 安装包使用 也可以直接使用

```html
<script type="module">
    import { getCLS, getFID, getLCP } from 'https://unpkg.com/web-vitals@0.2.4/dist/web-vitals.es5.min.js?module';

    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
</script>
```

更多详细移步:[web-vitals](https://www.npmjs.com/package/web-vitals)

### **performance.timing** 

> 这个API详细的记录 TCP连接,**DOM解析**,**白屏** 等时间

``` html
<script>
  let t = performance.timing;

  //DNS 解析耗时: domainLookupEnd - domainLookupStart
  //TCP 连接耗时: connectEnd - connectStart
  //SSL 安全连接耗时: connectEnd - secureConnectionStart
  //网络请求耗时 (TTFB): responseStart - requestStart
  //数据传输耗时: responseEnd - responseStart
  //DOM 解析耗时: domInteractive - responseEnd
  //资源加载耗时: loadEventStart - domContentLoadedEventEnd
  //First Byte时间: responseStart - domainLookupStart
  //白屏时间: responseEnd - fetchStart
  //首次可交互时间: domInteractive - fetchStart
  //DOM Ready 时间: domContentLoadEventEnd - fetchStart
  //页面完全加载时间: loadEventStart - fetchStart
  //http 头部大小： transferSize - encodedBodySize
  //重定向次数：performance.navigation.redirectCount
  //重定向耗时: redirectEnd - redirectStart

  if ((t = performance.memory)) {
    console.log('js内存使用占比 ：' +((t.usedJSHeapSize / t.totalJSHeapSize) * 100).toFixed(2) + '%');
  }
</script>
```

:::danger 如何做一个小型的监控系统?

- 通过上述的方法拿到自己想要的指标
- 去服务器上请求 一个 1KB 大小的图片 并带上这些指标参数
- 使用 navigator.sendBeacon() 发送
- Node 读取服务器日志 过滤有效的接口
- 对接口参数整理并进行分析
- 开启定时任务每天凌晨12.00 开始读取数据并绘制出图表

> **navigator.sendBeacon()** 方法可用于通过HTTP将少量数据异步传输到Web服务器 而不占用进程
>
> 发送可以使用的优先级
>
> 1. navigator.sendBeacon()
> 2. ajax
> 3. fetch

:::

## 性能的各项指标

### 各项指标的解释

| 阶段(简写) |                        描述                         |                  阶段(全称)                   |
| :--------: | :-------------------------------------------------: | :-------------------------------------------: |
|    TTFP    |                     首字节时间                      |              Time TO Frist Byte               |
|     FP     |                首次绘制(第一个节点)                 |                  First Paint                  |
|    FCP     |               首次有内容的绘制(骨架)                |            First Contentful Paint             |
|    FMP     |         首次有意义的绘制(包含所有元素/数据)         |               First Meaningful                |
|    TTI     | 达到可交互时间，推荐的响应时间是100ms以内否则有延迟 |              Time To Interactive              |
| Long tasks |                 超过了 50ms 的任务                  |                                               |
|  SSR&&CSR  |               服务端渲染和客户端渲染                | Server-Side-Rendering / Client Side Rendering |
| Isomorphic |                       同构化                        |                                               |

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-152509.png)

> 通过 chrome 面板上的 Performance 我们可以收集到上面的信息

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-152560.png)

### 最新的WEB指标

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-152915.png)

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153055.png)

| 阶段(简写) | 描述                                                         |           阶段(全称)            |
| :--------: | :----------------------------------------------------------- | :-----------------------------: |
|    LCP     | 最⼤内容绘制，⽤于记录视窗内最⼤的元素绘制的时间，该时间会随着⻚⾯渲染变化⽽变化，因为⻚⾯中的最⼤元素渲染过程中可能会发⽣改变，另外该指标会在⽤户第⼀次交互后停⽌记录 | LCP（Largest Contentful Paint） |
|    FID     | ⾸次输⼊延迟，记录在 FCP 和 TTI 之间⽤户⾸次与⻚⾯交互时响应的延迟 |    FID（First Input Delay）     |
|    TBT     | 阻塞总时间，记录在 FCP 到 TTI 之间所有⻓任务的阻塞时间总和   |   TBT（Total Blocking Time）    |
|    CLS     | 累计位移偏移，记录了⻚⾯上⾮预期的位移波动。使⽤按钮动态添加了某个元素，导致⻚⾯上其他位置的代码发⽣了偏移，造成了⻚⾯ | CLS（Cumulative Layout Shift）  |

**概念**

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153229.png)

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153346.png)

这些指标包括加载体验、交互性和页面内容的视觉稳定性,分别是 **LCP**,**FID**,**CLS**

**LCP**

**LPC** 全称 Largest Contentful Paint,用于衡量标准报告视口内可见的最大内容元素的渲染时间。为了提供良好的用户体验，网站应努力在开始加载页面的前 **2.5** 秒内进行 最大内容渲染

相比 FCP,这个指标就非常有价值了，因为这个值是根据页面加载渲染不断变化的，如果页面有一个 lodaing 动画，然后才渲染出具体内容，那么这个指标计算出来的就是具体内容的加载时间,而非 lodaing 动画的加载时间

**LCP考虑哪些元素**

LCP 目前并不会计算所有元素，因为这样会使这个指标变得非常复杂，它现在只关注下面的元素：

- img 元素
- image元素内的 svg元素
- video 元素
- 通过 url() 函数加载背景图片的元素
- 包含文本节点或其他内联文本元素子级的块级元素

**FID**

**FID** First Input Delay:即记录用户和页面进行首次交互操作所花费的时间.FID 指标影响用户对页面交互性和响应性的第一印象。为了提供良好的用户体验，站点应努力使首次输入延迟小于 **100** 毫秒。

FID 发生在 **FCP** 和 **TTI** 之间，因为这个阶段虽然页面已经显示出部分内容，但尚不具备完全的可交互性。这个阶段用户和页面交互，往往会有较大延迟。

例如:浏览器接收到用户输入操作时,主线程正在忙于执行一个耗时比较长的任务，只有当这个任务执行完成后，浏览器才能响应用户的输入操作。它必须等待的时间就此页面上该用户的 FID 值。

这个时候我们可以使用 **Web Worker**开启一个单独的线程中执行费时的处理任务，从而允许主（通常是UI）线程运行而不被阻塞。将非 UI 操作移至单独的工作线程可以减少主线程的阻塞时间，从而改善 FID

**CLS**

CLS 会测量在页面的整个生命周期中发生的每个意外的样式移动的所有单独布局更改得分的总和。布局的移动可能发生在可见元素从一帧到下一帧改变位置的任何时候。为了提供良好的用户体验，网站应努力使 CLS 分数小于 **0.1**

### SPA的分析

通常用 React/Vue 编写的代码打包后如下:

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153603.png)

**FCP/FMP**

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153710.png)

### 优化

**不要使用无尺寸元素**

图像和视频等元素上始终需要包括 width 和 height 尺寸属性，现代浏览器会根据图像的 width 和 height 属性设置图像的默认长宽比，知道纵横比后，浏览器就可以为元素计算和保留足够的空间。

或者，使用 aspect-ratio 也可以提前指定宽高比：

```css
img {
    aspect-ratio: attr(width) / attr(height);
}
```

**那响应式的图片**

可以使用 srcset 定义图像，使浏览器可以在图像之间进行选择，以及每个图像的大小。

```css
<img 
    width="1000" 
    height="1000"
    src="puppy-1000.jpg"
    srcset="puppy-1000.jpg 1000w,
            puppy-2000.jpg 2000w,
            puppy-3000.jpg 3000w"
    alt="ConardLi"
/>
```

- 永远不要在现有内容之上插入内容，除非是响应用户交互。这确保了预期的布局变化
- 很多页面广告都是动态插入的，所以一定要提前为广告位预留一定空间。

### 其他

> 在网站优化时,我们应该着重看以下几个指标。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-09-153927.png)



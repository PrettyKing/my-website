---
title: 性能优化(二)
date: 2021-05-11
author: 卫辰
---

## 网络测速

### HTML5API

**navigator.connection** (不是很准确),参考 [Navigator](https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator)

``` js
const connection = navigator.connection
// 获取当前网络信息类型
let type = connection.effectiveType  // 3g
// 网络信号的改变
connection.onchange = function (e) {
    console.log(connection.effectiveType);
}
console.log('是否在线', navigator.onLine)
console.log('网速', connection.downlink, 'MB/s')
window.addEventListener("online", () => {
    console.log('网络已连接')
});
window.addEventListener("offline", () => {
    console.log('网络已断开')
});
```

### img实现测速

在服务器放个 1KB 的图片 看返回时间差

###  多普勒测速

分五次请求，计算公式

1. api?http1.0&t=1&size=0k
2. api?http1.1&t=2&size=0k
3. api?http1.1&t=3&size=0k
4. api?http1.1&t=4&size=10k
5. api?http1.1&t=5&size=40k

- T1 = DNS + New Connection(TCP) +RTT(一次传输)
- T2 = New Connection(TCP) +RTT(一次传输)
- T3 = RTT(一次传输)
- 10k/(t4-t3)~TCP bandwidth
- (40k-10k)/(t5-t4)~TCP bandwidth

如果网速慢 可以给用户出 一倍图,获取隐藏部分,只显示重要部分



## 网站资源加载顺序

:::danger

**CSS和 JS 是否会阻塞页面解析渲染?**

:::

###  CSS加载会阻塞DOM树解析和渲染吗?

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        h1 {
            color: red !important;
        }
    </style>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
    <script>
        function h() {
            console.log(document.querySelectorAll('h1'))
        }
        setTimeout(h, 0)
    </script>
</head>

<body>
    <h1>这是红色的</h1>
</body>

</html>
```

我们假设 CSS 会阻塞DOM树解析和渲染,那么会出现以下情况:

在bootstrap.css还没加载完之前，下面的内容不会被解析渲染。那么我们一开始看到的应该是**白屏**,h1不会显示出来。并且此时console.log的结果应该是一个**空数组**。

打开浏览器,我们发现在bootstrap.css还没加载完成的时候,h1并没有显示，但是此时控制台输出 [h1],可以得知:

DOM树至少已经解析完成到了h1那里,而此时css还没加载完成,也就说明，**CSS并不会阻塞DOM树的解析**。

**那么CSS加载会阻塞DOM树渲染？**

上面操作可以发现,在 CSS 未加载完之前,页面都是处于白屏,CSS加载完后,红色字体才显示出来.下面的内容虽然解析了,但是并没有被渲染出来。所以: **CSS加载会阻塞DOM树渲染**。

### CSS加载会阻塞JS运行吗？

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        console.log('before css')
        var startDate = new Date()
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
</head>

<body>
    <h1>这是红色的</h1>
    <script>
        var endDate = new Date()
        console.log('after css')
        console.log('经过了' + (endDate - startDate) + 'ms')
    </script>
</body>

</html>
```

假设:CSS会阻塞后面的JS运行,在link后面的js代码，应该要在CSS加载完成后才会输出

经过运行我们发现,位于 CSS 加载前的 JS 先执行,位于CSS 后面的JS 等到 CSS 加载完后 才执行,并且经过了 **169ms** 才执行。我们得出结论: **CSS 会阻塞后面JS的执行**。

### 解析

浏览器的渲染机制一般分为以下几个步骤:

1. 处理 HTML 并构建 DOM 树 🌲
2. 处理 CSS 构建 CSSOM 树 🌲
3. 将 DOM 和 CSSOM 合并成一个渲染树 🌲
4. 根据渲染树来布局,计算每个节点的位置
5. 调用 GPU 绘制,合成图层,显示在屏幕

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-130047.png)

从图解可以看出

1. DOM 解析和CSS解析是两个并行的进程,它们分别由不同的解析引擎去分析,这也解释了为什么CSS加载不会阻塞DOM的解析。
2. 由于Render Tree是依赖于DOM Tree和CSSOM Tree的，所以他必须等待到CSSOM Tree构建完成，也就是CSS资源加载完成(或者CSS资源加载失败)后，才能开始渲染。因此,CSS加载是会阻塞Dom的渲染的
3. 由于js可能会操作之前的Dom节点和css样式，因此浏览器会维持html中css和js的顺序。因此，样式表会在后面的js执行前先加载执行完毕。所以css会阻塞后面js的执行。

### 页面加载主要有两个事件

对于浏览器来说,页面加载主要有两个事件,一个是 **DOMContentLoaded**,另一个是 **onLoad**

:::danger

- onLoad：等待页面的所有资源都加载完成才会触发，这些资源包括css、js、图片视频等
- DOMContentLoaded：当页面的内容解析完成后，则触发该事件

:::

正如我们上面讨论过的,CSS会阻塞DOM渲染和JS执行，而JS会阻塞DOM解析。那么我们可以做出这样的假设

1. 当页面只存在css，或者js都在css前面，那么DomContentLoaded不需要等到css加载完毕。
2. 当页面里同时存在css和js，并且js在css后面的时候，DomContentLoaded必须等到css和js都加载完毕才触发。

####  CSS不会阻塞 DOM Ready

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded');
      })
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
  </head>
  <body>
  </body>
</html>
```

可以看到,CSS还未加载完,就已经触发了 **DOMContentLoaded**事件了。因为CSS后面没有任何JS代码。

#### CSS会阻塞 DOM Ready

```html
<html lang="en">
  <head>
    <title>css阻塞</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded');
      })
    </script>
    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
    <script>
      console.log('到我了没');
    </script>
  </head>
  <body>
  </body>
</html>
```

可以看到,只有在css加载完成后,才会触发 **DOMContentLoaded** 事件,因为 CSS 后面有JS代码

### 总结

1. CSS加载 不会阻塞 **DOM** 🌲的解析
2. CSS加载 会阻塞 DOM 🌲 的渲染
3. CSS加载 会阻塞 **后面JS** 语句的执行
4. CSS下面没有JS时 不会阻塞 **DOM Ready**
5. CSS下面有JS时 会影响 **DOM Ready**



## 浏览器渲染流程

:::danger 话不多说，先来分析一波

1. 网页的渲染流程
   1. 浏览器的dom是分层的，网页是3D的。
   2. 对DOM元素节点计算样式结果 Recalculate Style样式重计算
   3. 为每个节点生成图形位置Layout回流重排
   4. 将每个节点绘制填充到图层中Paint
   5. 图层作为纹理上传到GPU
   6. Composite Layers 合成层把符合图层生成到页面
2. Composite Layers 做了什么？
   1. 图层的绘制列表，准备好，主线程 commit 合成线程
   2. 合成线程 viewport rt 划分图块
   3. 生成位图   栅格化（光栅化） raster
   4. 所有图块 GPU合成生成DarwQuad提交给浏览器渲染进程
   5. viz组件  接收到DarwQuad 绘制到我们的屏幕上

:::

### 页面分层

在 **performance** 里面点击 **Layers** 可以看到图层的列表

- 根元素
- position
- transform
- 半透明
- css滤镜
- canvas
- video
- overflow

页面光分层不行,让 **GPU** 参与工作才是提升性能的王道,那些属性能让 **GPU** 参与工作呢?

### CPU硬件加速

- CSS3D
- video
- webgl
- transform
- will-change:transform

### 一些影响重排重绘的操作

::: tip

**重绘** 是我们改动元素的字体颜色,背景色等外观元素时候,并不会改变它的大小,也不会影响其他元素的布局,这个时候就不需要重新构建渲染树。浏览器会对元素的样式重新绘制,这个过程叫做 "重绘"

重绘的触发: 任何对元素样式,如 **color**,**background-color** 等属性的改变,JS和CSS都会引起重绘。

**重排** 一般来说盒子动了必定必定会 **重排**,因此建议使用怪异盒模型,固定盒子的大小.



注意：重排必定引起重绘

:::

哪些操作能影响重绘？

- 添加/删除元素
- 内容发生改变(文字数量或图片大小等等)
- display:none
- 移动元素位置
- 修改浏览器大小,字体大小

**还有一些读取操作也可能引起重排**

- offset(Top|Left|Width|Height)
- scroll(Top|Left|Width|Height)
- client(Top|Left|Width|Height)
- getComputedStyle()

:::danger 为什么读取也会造成**重排**?

因为在用JS操作DOM时,浏览器会把操作维护在一个队列中,当达到一定的数量浏览器再统一去执行队列中的操作.当去查询这些属性时,浏览器就会强制刷新队列。因为如果不立即执行队列中的任务,有可能得到的结果是错误的。相当于你强制打断了浏览器的优化流程，引起了重排.

:::

> **[csstriggers (opens new window)](https://csstriggers.com/)可查看是否引起重排重绘**。

#### 减少不必要的重绘

利用 **DevTools** 识别 paint 的瓶颈,Chrome 工具的使用：

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-132404.png)

```txt
蓝色:网络通信和 HTML 解析
黄色:JavaScript 执行时间
紫色:样式计算和布局,即 Layout 重排
绿色:Paint 重绘
```

**CSS 是否会引起重排和重绘**?

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .box {
            width: 100px;
            height: 100px;
            border: 1px solid #ccc;
            border-radius: 50%;
            position: absolute;
            animation: cicleBox 2s infinite;
        }

        @keyframes cicleBox {
            0% {
                /* top: 0;
                left: 0; */
                transform: translate(0, 0);
            }

            25% {
                /* top: 0;
                left: 200px; */
                transform: translate(200px, 0);
            }

            50% {
                /* top: 200px;
                left: 200px; */
                transform: translate(200px, 200px);
            }

            75% {
                /* top: 200px;
                left: 0; */
                transform: translate(0, 200px);
            }
        }
    </style>
</head>

<body>
    <div class="box"></div>
</body>

</html>
```

运行上面的例子，打开 **performance** 进行录制：

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-132630.png)

发现一直在执行 Layout(重排)-Paint(重绘)-Composite Layers(合成)的过程

使用 **transform** 开启硬件加速后,再次录制如下:

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-132745.png)

可以清楚的看到主线程现在处于空闲状态,而 **GPU** 参与了工作,直接跳过了重绘和重排的过程,大大的提升了性能!

::: tip 小结

使用 **top** **left** 会发现不断的重排和重绘

使用 **transform** 则没有

:::

###  使用**fastdom**增加 页面的流畅度

 [fastdom事例](http://wilsonpage.github.io/fastdom/examples/animation.html)，下面用fastdom来写个demo：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>fastdom读写分离</title>
    <style>
        div {
            display: flex;
            margin: 20px;
        }

        div img {
            height: 375px;
            padding: 10px;
        }
    </style>
</head>

<body>
    <div>
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
    </div>
    <div>
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
    </div>
    <div>
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
        <img src="https://dss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1593106255,4245861836&fm=26&gp=0.jpg">
    </div>

    <script>
        const update = (times) => {
            let imgs = document.getElementsByTagName('img')
            for (let i = 0; i < imgs.length; i++) {
                imgs[i].style.width = ((Math.sin(imgs[i].offsetTop + times / 1000) + 1) * 500) + 'px'
            }
            window.requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    </script>
</body>

</html>
```

我们点开 **performance**,查看页面绘制过程发现不停的 **Recalculate** 和进行 **layout**:

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-133248.png)

但是我们使用 [fastdom](https://github.com/LiLixikun/Blog-example/blob/master/packages/performance/fastdom1.html)进行读写分离后,发现进行了统一的操作,大大减少了浏览器的开销:

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-133341.png)

#### 如果想执行动画操作

如果想执行动画操作,可以使用 **requestAnimationFrame** 要求浏览器在下次重绘之前调用指定的回调函数更新动画,可以达到和浏览器同步刷新,以避免不必要的开销.

## 一张图

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-10-133524.png)
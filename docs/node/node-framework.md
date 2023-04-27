---
title: NodeJS 项目架构与优化
date: 2020-11-15
author: 卫辰
---
## 目标：

- NodeJS 异步 IO 原理浅析及优化方案
- NodeJS 内存管理机制及内存优化
- 大规模 Node 站点结构原理分析
- 服务器集群管理与 Node 集群的应用
- UV 过千万的 Node 站点真身

### NodeJS 异步 IO 原理浅析及优化方案

1. NodeJS 异步 IO 原理浅析及优化方案

  - 异步 IO 的是与非
  - Node 对异步 IO 的实现
  - 几个特殊的 API
  - 函数式编程在 Node 中的应用
  - 常用的 Node 控制异步 API 的技术手段

2. 异步 IO 的好处

  - 前端通过异步 IO 可以消除 UI 堵塞。
  - 假设请求资源 A 的时间为 M,请求资源 B 的时间为 N.那么同步的 请求耗时为 M+N.如果采用异步方式占用时间为 Max(M,N)。
  - 随着业务的复杂，会引入分布式系统，时间会线性的增加， M+N+...和 Max(M,N...)，这会放大同步和异步之间的差异。
  - I/O 是昂贵的，分布式 I/O 是更昂贵的。
  - NodeJS 适用于 IO 密集型不适用 CPU 密集型

3. Node 对异步 IO 的实现

> 完美的异步 IO 应该是应该是应用程序发起非阻塞 调用，无需通过遍历或者事件幻想等方式轮询。

![实现图](http://qiniu.faithcal.com/node-1.png)

4. 几个特殊的 API

  - SetTimeout 和 SetInterval 线程池不参与
  - process.nextTick() 实现类似 SetTimeout(function(){},0);每次调用放入队列中， 在下一轮循环中取出。
  - setImmediate();比 process.nextTick()优先级低
  - Node 如何实现一个 Sleep?

    ```javascript
    async function test() {
      console.log('hello');
      await sleep(1000);
      console.log('world');
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    test();
    ```

    ```javascript
    //思考输出顺序
    setTimeout(function() {
      console.log(1);
    }, 0);

    setImmediate(function() {
      console.log(2);
    }, 0);

    process.nextTick(() => {
      console.log(3);
    });

    new Promise((resovle, reject) => {
      console.log(4);
      resovle(4);
    }).then(function() {
      console.log(5);
    });
    console.log(6);
    ```

5. 函数式编程在 Node 中的应用

  1. 高阶函数:可以将函数作为输入或者返回值，形成一种 后续传递风格的结果接受方式，而非单一的返回值形式。 后续传递风格的程序将函数业务重点从返回值传递到回调 函数中。

  ```javascript
  app.use(function(){//todo})。
  var emitter = new events.EventEmitter; emitter.on(function(){//..........todo})
  ```

  2. 偏函数:指定部分参数产生一个新的定制函数的形式就 是偏函数。Node 中异步编程非常常见，我们通过哨兵变量 会很容易造成业务的混乱。underscore，after 变量


6. 常用的Node控制异步技术手段
  - Step、wind(提供等待的异步库)、Bigpipe、Q.js
  - Async、Await
  - Promise/Defferred是一种先执行异步调用，延迟传递的处理方式。Promise是 高级接口，事件是低级接口。低级接口可以构建更多复杂的场景，高级接口一 旦定义，不太容易变化，不再有低级接口的灵活性，但对于解决问题非常有效
  - 由于Node基于V8的原因，目前还不支持协程。协程不是进程或线程，其执行 过程更类似于子例程，或者说不带返回值的函数调用。
  
  > 一个程序可以包含多个协程，可以对比与一个进程包含多个线程，因而下面我们来比较协程和线程。我们知道多个线程相对独立，有自己的上下文，切换受系统控制;而协程也相对独立，有自己的上下文，但是其切换由自己控制，由 当前协程切换到其他协程由当前协程来控制。

###  内存管理机制及内存优化

1. V8垃圾回收机制(1)

   1. Node使用JavaScript在服务端操作大内存对象受到了一定的限制 (堆区)，64位系统下约为1.4GB，栈区32位操作系统下是0.7G. 新生代64位是32M 32位是16M

      ```js
      node —max-new-space-size app.js:
      -max-old-space-size app.js
      ```

   2. ```Process.memoryUsage->rss、heaptTotal、heapUsed```

   3. V8的垃圾回收策略主要基于分代式垃圾回收机制。在自动垃圾 回收的演变过程中，人们发现没有一种垃圾回收算法能够胜任 所有场景。V8中内存分为新生代和老生代两代。新生代为存活 时间较短对象，老生代中为存活时间较长的对象。

   4. 目前 V8 采用了两个垃圾回收器，主垃圾回收 器 -Major GC (主要负责老生代的垃圾回 收。)和副垃圾回收器 -Minor GC (Scavenger主 要负责新生代的垃圾回收)V8 之所以使用了两 个垃圾回收器，主要是受到了代际假说的影响

   5. 第一个是大部分对象都是“朝生夕死”的。形容 有些变量存活时间很短。

      第二个是不死的对象，会活得更久，比如全局 的 window、DOM、Web API 等对象。

2. Scavenge算法

   > 在分代基础上，新生代的对象主要通过Scavenge算法进行 垃圾回收，再具体实现时主要采用Cheney算法。Cheney算 法是一种采用复制的方式实现的垃圾回收算法。它将内存 一分为二，每一个空间称为semispace。这两个semispace中 一个处于使用，一个处于闲置。处于使用的称之为From, 闲置的称之为To.分配对象时先分配到From,当开始进行垃 圾回收时，检查From存活对象赋值到To.非存活被释放。 然后互换位置。再次进行回收，发现被回收过直接晋升， 或者发现To空间已经使用了超过25%。他的缺点是只能使 用堆内存的一半，这是一个典型的空间换时间的办法，但 是新生代声明周期较短，恰恰就适合这个算法。

   > V8老生代主要采用Mark-Sweep和Mark-compact,在使 用Scavenge不合适。一个是对象较多需要赋值量太大 而且还是没能解决空间问题。Mark-Sweep是标记清 楚，标记那些死亡的对象，然后清除。但是清除过 后出现内存不连续的情况，所以我们要使用Mark- compact，他是基于Mark-Sweep演变而来的，他先将 活着的对象移到一边，移动完成后，直接清理边界 外的内存。当CPU空间不足的时候会非常的高效。 V8后续还引入了延迟处理，增量处理，并计划引入 并行标记处理。

3. 查看内存DEMO

   ```js
   function Yideng(name) { 
     this.name = name;
   }
   //demo1
   let student1 = new Yideng(); 
   let student2 = new Yideng(); 
   setTimeout(function () {
   	student1 = null; 
   },3000);
   
   //demo2
   let student1 = new Yideng("zhijia"); 
   let ydSet = new Set(); 
   ydSet.add(student1)
   student1 = null;
   ydSet = null;
   
   
   //闭包在堆区
   let YidengFactory = function (name) {
   	let student = new Yideng(name); 
     return function () {
   		console.log(student);
   	} 
   }
   
   let p1 = YidengFactory("老袁"); 
   p1();
   p1 = null;
   ```

4. V8垃圾回收机制(2)

   1. 垃圾回收是通过 GC Root(全局的 window 对象(位于 每个 iframe 中)、文档 DOM 树、存放栈上变量) 标记空间中活动对象和非活动对象。从 GC Roots 对 象出发，遍历 GC Root 中的所有对象，能遍历到的 对象，该对象是可访问的(reachable)，那么必须 保证这些对象应该在内存中保留，也称可访问的对 象为活动对象;通过 GC Roots 没有遍历到的对象， 则是不可访问的(unreachable)，那么这些不可访 问的对象就可能被回收，称不可访问的对象为非活 动对象。
   2. V8垃圾回收执行效率
      1. 主线程停下来进行GC 叫全停顿(Stop-The-World)为了解决全停顿带来的卡 顿。V8内部还有并行、并发、增加等垃圾回收技术。
      2. 并行回收，在执行一个完整的垃圾回收过程中，垃圾回收器会使用多个辅助 线程来并行执行垃圾回收。增量式垃圾回收，垃圾回收器将标记工作分解为更 小的块，并且穿插在主线程不同的任务之间执行。并发回收，回收线程在执行 JavaScript 的过程，辅助线程能够在后台完成的执行垃圾回收的操作。
   3. V8又是怎么执行标记
      1.  V8提出了三色标记法。黑色和白色，还额外引入了灰色。黑色表示这个节点被 GC Root 引用到了，而且 该节点的子节点都已经标记完成了。白色表示这个节点没有被访问到，如果在本轮遍历结束时还是白色，那 么这块数据就会被收回。
      2. 灰色表示这个节点被 GC Root 引用到，但子节点还没被垃圾回收器标记处理，也表明目前正在处理这个节 点;为啥会有灰?window.a ={};window.a.b ={}; window.a.b.c={};图2扫完一遍以后，window.a.b = [];导致b切开 了，但是d确实闲置。增量垃圾回收器添加了一个约束条件:不能让黑色节点指向白色节点。写屏障 (Write- barrier) 机制，写屏障机制会强制将被引用的白色节点变成灰色的，这样就保证了黑色节点不能指向白色节 点的约束条件。这个方法也被称为强三色不变性。因为在标记结束时的所有白色对象，对于垃圾回收器来 说，都是不可到达的，可以安全释放。在 V8 中，每次执行如 window.a.b = value的写操作之后，V8 会插入 写屏障代码，强制将 value 这块内存标记为灰色。

5. 常见内存泄露问题

   1. 无限制增长的数组
   2. 无限制设置属性和值
   3. 任何模块内的私有变量和方法均是永驻 内存的 a = null
   4. 大循环，无GC机会

### Node 集群的应用

1. 预备上线

   1. 前端工程化的搭载动态文件的MAP分析压缩打 包合并至CDN
   2. 单测、压测 性能分析工具发现Bug
   3. 编写nginx-conf实现负载均衡和反向代理
   4. PM2启动应用程序小流量灰度上线，修复BUG

2. 多线程

   1. Master进程均为主进程，Fork可以创造主从进程。
   2. 通过child_process可以和NET模块组合，可以创建多个线程并监 听统一端口。通过句柄传递完成自动重启、发射自杀信号、 限量重启、负载均衡。
   3. Node默认的机制是采用操作系统的抢占式策略。闲着的进程争 抢任务，但是会造成CPU闲置的IO暂时并未闲置。Node后来引 入了Round-Robin机制，也叫轮叫调度。主进程接受任务，在发送给子进程。
   4. 每个子进程做好自己的事，然后通过进程间通信来将他们连 接起来。这符合Unix的设计理念，每个进程只做一件事，并做 好。将复杂分解为简单，将简单组合成强大。

   ```js
   var cluster = require('cluster');
   var http = require('http');
   var numCPUs = require('os').cpus().length;
   
   if (cluster.isMaster) { 
     require('os').cpus().forEach(function(){
       cluster.fork();
     });
   	cluster.on('exit', function(worker, code, signal) { 
       console.log('worker ' + worker.process.pid + ' died');
   	});
   	cluster.on('listening', function(worker, address) {
   		console.log("A worker with #"+worker.id+" is now connected to " + address.address +":" + address.port); 
     });
   } else { 
     http.createServer(function(req, res) {
   		res.writeHead(200);
   		res.end("hello world\n");
   		console.log('Worker #' + cluster.worker.id + ' make a response');
   }).listen(8000); }
   ```

3. PM2

   > pm2 是一个带有负载均衡功能的Node应用的进程管理器. 当你要把你的独立代码利用全部的服务器上的所有CPU，并保证进程永远都活 着，0秒的重载。

   1. 内建负载均衡(使用Node cluster 集群模块)
   2. 后台运行
   3. 0秒停机重载
   4. 具有Ubuntu和CentOS 的启动脚本
   5. 停止不稳定的进程(避免无限循环)
   6. 控制台检测
   7. 提供 HTTP API
   8. 远程控制和实时的接口API ( Nodejs 模块,允许和PM2进程管理器交互 )
   
   > 测试过Nodejs v0.11 v0.10 v0.8版本，兼容CoffeeScript,基于Linux 和MacOS.
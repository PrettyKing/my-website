---
title: EventLoop
date: 2021-06-27
author: 卫辰
---



## 什么是EventLoop

Event Loop 是一个很重要的概念，指的是计算机系统的一种运行机制。

JavaScript语言就采用这种机制，来解决单线程运行带来的一些问题。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124243.png)

想要理解Event Loop，就要从程序的运行模式讲起。运行以后的程序叫做["进程"](https://zh.wikipedia.org/wiki/进程)（process），一般情况下，一个进程一次只能执行一个任务。

如果有很多任务需要执行，不外乎三种解决方法。

**1）排队** 因为一个进程一次只能执行一个任务，只好等前面的任务执行完了，再执行后面的任务。

**2）新建进程** 使用fork命令，为每个任务新建一个进程。

**3）新建线程** 因为进程太耗费资源，所以如今的程序往往允许一个进程包含多个线程，由线程去完成任务。（进程和线程的详细解释，请看[这里](https://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html)。）



::: danger JavaScript为什么是单线程，难道不能实现为多线程吗？

这跟历史有关系。JavaScript从诞生起就是单线程。原因大概是不想让浏览器变得太复杂，因为多线程需要共享资源、且有可能修改彼此的运行结果，对于一种网页脚本语言来说，这就太复杂了。后来就约定俗成，JavaScript为一种单线程语言。（Worker API可以实现多线程，但是JavaScript本身始终是单线程的。）

:::



**例如:** 如果某个任务很耗时，比如涉及很多I/O（输入/输出）操作，那么线程的运行大概是：

- 单线程：由于I/O操作很慢，所以这个线程的大部分运行时间都在空等I/O操作的返回结果。这种运行方式称为"同步模式"（synchronous I/O）或"堵塞模式"（blocking I/O）。如图：

  ![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124331.png)

- 多线程：多线程不仅占用多倍的系统资源，也闲置多倍的资源。如图：

  ![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124402.png)

Event Loop就是为了解决这个问题而提出的。[Wikipedia](https://en.wikipedia.org/wiki/Event_loop)这样定义：

> "**Event Loop是一个程序结构，用于等待和发送消息和事件。**（a programming construct that waits for and dispatches events or messages in a program.）"

简单说，就是在程序中设置两个线程：一个负责程序本身的运行，称为"主线程"；另一个负责主线程与其他进程（主要是各种I/O操作）的通信，被称为"Event Loop线程"（可以译为"消息线程"）。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-123855.png)

上图主线程的绿色部分，还是表示运行时间，而橙色部分表示空闲时间。每当遇到I/O的时候，主线程就让Event Loop线程去通知相应的I/O程序，然后接着往后运行，所以不存在红色的等待时间。等到I/O程序完成操作，Event Loop线程再把结果返回主线程。主线程就调用事先设定的回调函数，完成整个任务。

可以看到，由于多出了橙色的空闲时间，所以主线程得以运行更多的任务，这就提高了效率。这种运行方式称为"[异步模式](https://en.wikipedia.org/wiki/Asynchronous_I/O)"（asynchronous I/O）或"非堵塞模式"（non-blocking mode）。

这正是JavaScript语言的运行方式。单线程模型虽然对JavaScript构成了很大的限制，但也因此使它具备了其他语言不具备的优势。如果部署得好，JavaScript程序是不会出现堵塞的，这就是为什么node.js平台可以用很少的资源，应付大流量访问的原因。



## 浏览器中的EventLoop

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124549.png)

### 异步队列分类

> 异步队列又分为:宏任务队列和微任务队列

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124643.png)

### 浏览器中的任务队列

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-124836.png)

### 几个关于浏览器的EventLoop的练习

```js
// 1、宏任务和微任务的执行顺序
// 宏任务队列：setTimeout
// 微任务队列：Promise
// 同步：promise init ，promise end，微任务：promise result:1，宏任务：timeout
setTimeout(() => {
   console.log("timeout");
}, 0);

const promise = new Promise(resolve => {
  console.log("promise init");
  resolve(1);
  console.log("promise end");
});

promise.then(res => {
  console.log("promise result:", res);
});

// 2、宏任务微任务交错执行
// promise2 timeout1 promise1 timeout2
setTimeout(() => {
  console.log("timeout1");
  Promise.resolve().then(() => {
    console.log("promise1");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("promise2");
  setTimeout(() => {
    console.log("timeout2");
  }, 0);
});

// 3、 async await 拆解
// 如果 await 后是一个简单类型，则进行 Promsie 包裹
// 如果 await 后是一个 thenable 对象，则不用进行 Promsie 包裹（chrome 的优化）
async function fn() {
  return await 1234;
//   return Promise.resolve(1234)
}
fn().then(res => console.log(res));

await thenable
async function fn() {
  return await ({
    then(resolve) {
        resolve(1234);
    }
  });
}
fn().then(res => console.log(res));

// 4、使用 async await 顺序判断（将 async await 转换成我们熟悉的 Promise）
async function async1() {
  console.log("async1 start");
  // 可转换
  await async2();
  console.log("async1 end");
  //   new Promise(resolve => {
  //     console.log("async2")
  //     resolve()
  //   }).then(res => console.log("async1 end"))
}
async function async2() {
  console.log("async2");
}
async1();
console.log('script')

// 5、如果 promise 没有 resolve 或 reject。
  async function async1 () {
    console.log('async1 start');
    await new Promise(resolve => {
      console.log('promise1')
    })
    console.log('async1 success');
    return 'async1 end'
  }
  console.log('srcipt start')
  async1().then(res => console.log(res))
  console.log('srcipt end')

// 6、某大厂真实面试题
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
  console.log("promise1");
  resolve();
})
  .then(function() {
    console.log("promise2");
  })
  .then(function() {
    console.log("promise3");
  })
  .then(function() {
    console.log("promise4");
  });
console.log("script end");

//  7、resolve 处理 thenable ，也会包裹一层 promise。
// 普通的 function async2
// return thenable 的 async2
// async 的 async2
async function async1() {
  console.log("async1 start");
  return new Promise(resolve => {
    resolve(async2());
  }).then(() => {
    console.log("async1 end");
  });
}
 function async2() {
  console.log("async2");
}
setTimeout(function() {
  console.log("setTimeout");
}, 0);
async1();
new Promise(function(resolve) {
  console.log("promise1");
  resolve();
})
  .then(function() {
    console.log("promise2");
  })
  .then(function() {
    console.log("promise3");
  })
  .then(function() {
    console.log("promise4");
  });

```

## NODEJS 中的EventLoop

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-125819.png)

### 异步队列执行阶段

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-125904.png)

### NODEJS中的任务队列

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-06-27-125951.png)

### NODEJS的练习

```js
// 比较 setImmediate 和 setTimeout 的执行顺序
// setTimeout(_ => console.log('setTimeout'))
// setImmediate(_ => console.log('setImmediate'))

// 如果两者都在一个 poll 阶段注册，那么执行顺序就能确定。
const fs = require('fs')
fs.readFile('./index.html',()=>{
    setTimeout(_ => console.log("setTimeout"));
    setImmediate(_ => console.log("setImmediate"));
})

// 理解 process.nextTick
// 每一个阶段执行完成之后，在当前阶段尾部触发 nextTick
// 案例：常见的 nodejs 回调函数第一个参数，都是抛出的错误
function apiCall(arg, callback) {
  if (typeof arg !== "string")
    return process.nextTick(
      callback,
      new TypeError("argument should be string")
    );
}
fs.readFile('./index.html',(err,data)=>{
    setTimeout(_ => console.log("setTimeout"));
    setImmediate(_ => console.log("setImmediate"));
})

// 比较 process.nextTick 和 setImmediate
// process.nextTick() 在同一个阶段尾部立即执行。
// setImmediate() 在事件循环的 check 阶段触发。
setImmediate(()=>{
    console.log('setImmediate')
})
process.nextTick(()=>{
    console.log('nextTick')
})

```

Node 中的任务比较:

- 比较 setImmediate 和 setTimeout 的执行顺序
- 理解 process.nextTick
- 比较 process.nextTick 和 setImmediate

### 不同版本的NODEJS的EventLoop

- node11 版本之前：

  ```
  一旦执行一个阶段，会先将这个阶段里的所有任务执行完成之后，
  才会执行该阶段剩下的微任务。
  ```

- node11 版本之后(和浏览器行为保持了一致)

  一旦执行一个阶段里的一个宏任务，就立刻执行对应的微任务队列。

```js
// timers 阶段的执行时机变化
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)

// check 阶段的执行时机变化
setImmediate(() => console.log('immediate1'));
setImmediate(() => {
    console.log('immediate2')
    Promise.resolve().then(() => console.log('promise resolve'))
});
setImmediate(() => console.log('immediate3'));
setImmediate(() => console.log('immediate4'));

// nextTick 队列的执行时机变化
setImmediate(() => console.log('timeout1'));
setImmediate(() => {
    console.log('timeout2')
    process.nextTick(() => console.log('next tick'))
});
setImmediate(() => console.log('timeout3'));
setImmediate(() => console.log('timeout4'));
```


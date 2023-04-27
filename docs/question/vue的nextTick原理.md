---
title: vue的$nextTick原理
date: 2021-07-23
tags:
 - question
categories:
 - 问题积累
---

## js的运行机制

> JS运行机制(Event Loop)

JS执行是单线程的，它是基于事件循环的。

- 所有同步任务都在主线程上执行，形成个执行栈。
- 主线程之外，会存在一个任务队列， 只要异步任务有了结果，就在任务队列中放置个事件 。
- 当执行栈中的所有同步任务执行完后，就会读取任务队列。那些对应的异步任务，会结束等待状态，进入执行栈。
- 主线程不断重复第三步。

这里主线程的执行过程就是一个tick, 而所有的异步结果都是通过任务队列来调度。Event Loop 分为宏任务和微任务，无论是执行宏任务还是微任务，完成后都会进入到一下tick,并在两个tick 之间进行UI渲染。

由于Vue DOM更新是异步执行的，即修改数据时，视图不会立即更新，而是会监听数据变化，并缓存在同一事件循环中，等同一数据循环中的所有数据变化完成之后，再统一进行视图更新。 为了确保得到更新后的 DOM，所以设置了Vue .nextTick()方法。

## 什么是$nextTick

> Vue 的核心方法之一， 官方文档解释如下: 在下次DOM 更新循环结束之 后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的DOM。

### 1.MutationObserver

先简单介绍下MutationObserver: MO是HTMLS中的API, 是一个用于监视DOM变动的接口，它可以监听一个DOM对象上发生的子节点删除、属性修改、文本内容修改等。调用过程是 要先给它绑定回调，得到MO实例，这个回调会在MO实例监听到变动时触发。这里MO的回调是放在microtask中执行的。

```js
// 创建MO实例
const observer = new MutationObserver(callback)
const textNode = "想要监听的Don节点"
observer.observe(textNode, {
  characterData: true, // 说明监听文本内容的修改
})
```

### 2.源码浅析

nextTick的实现单独有一个JS文件来维护它，在src/core/util/next-tick.js 中。nextTick 源码主要分为两块:能力检测和根据能力检测以不同方式执行回调队列。

`能力检测`

由于宏任务耗费的时间是大于微任务的，所以在浏览器支持的情况下，优先使用微任务。如果浏览器不支持微任务，再使用宏任务。

```js
// 空函数，可用作函数占位符
import { noop } from "shared/util"

// 错误处理函数
import { handleError } from "./error"

// 是否是IE、IOS、内置函数
import { isIE, isIOS, isNative } from "./env"

// 使用 MicroTask 的标识符，这里是因为火狐在<=53时 无法触发微任务，在modules/events.js文件中引用进行安全排除
export let isUsingMicroTask = false

// 用来存储所有需要执行的回调函数
const callbacks = []

// 用来标志是否正在执行回调函数
let pending = false

// 对callbacks进行遍历，然后执行相应的回调函数
function flushCallbacks() {
  pending = false
  // 这里拷贝的原因是：
  // 有的cb 执行过程中又会往callbacks中加入内容
  // 比如 $nextTick的回调函数里还有$nextTick
  // 后者的应该放到下一轮的nextTick 中执行
  // 所以拷贝一份当前的，遍历执行完当前的即可，避免无休止的执行下去
  const copies = callbcks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc // 异步执行函数 用于异步延迟调用 flushCallbacks 函数

// 在2.5中，我们使用(宏)任务(与微任务结合使用)。
// 然而，当状态在重新绘制之前发生变化时，就会出现一些微妙的问题
// (例如#6813,out-in转换)。
// 同样，在事件处理程序中使用(宏)任务会导致一些奇怪的行为
// 因此，我们现在再次在任何地方使用微任务。
// 优先使用 Promise
if (typeof Promise !== "undefined" && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)

    // IOS 的UIWebView, Promise.then 回调被推入 microTask 队列，但是队列可能不会如期执行
    // 因此，添加一个空计时器强制执行 microTask
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    MutationObserver.toString === "[object MutationObserverConstructor]")
) {
  // 当 原生Promise 不可用时，使用 原生MutationObserver
  // e.g. PhantomJS, iOS7, Android 4.4

  let counter = 1
  // 创建MO实例，监听到DOM变动后会执行回调flushCallbacks
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true, // 设置true 表示观察目标的改变
  })

  // 每次执行timerFunc 都会让文本节点的内容在 0/1之间切换
  // 切换之后将新值复制到 MO 观测的文本节点上
  // 节点内容变化会触发回调
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter) // 触发回调
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

延迟调用优先级如下: Promise > MutationObserver > setlmmediate > setTimeout

```js
export function nextTick(cb? Function, ctx: Object) {
    let _resolve
    // cb 回调函数会统一处理压入callbacks数组
    callbacks.push(() => {
        if(cb) {
            try {
                cb.call(ctx)
            } catch(e) {
                handleError(e, ctx, 'nextTick')
            }
        } else if (_resolve) {
            _resolve(ctx)
        }
    })

    // pending 为false 说明本轮事件循环中没有执行过timerFunc()
    if(!pending) {
        pending = true
        timerFunc()
    }

    // 当不传入 cb 参数时，提供一个promise化的调用
    // 如nextTick().then(() => {})
    // 当_resolve执行时，就会跳转到then逻辑中
    if(!cb && typeof Promise !== 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}
```

next-tick.js对外暴露了nextTick 这一个参数， 所以每次调用Vue .nextTick时会执行

- 把传入的回调函数cb压入callbacks 数组
- 执行timerFunc函数，延迟调用flushCallbacks 函数
- 遍历执行callbacks 数组中的所有函数

这里的callbacks 没有直接在nextTick 中执行回调函数的原因是保证在同一个tick 内多次执行nextTick, 不会开启多个异步任务，而是把这些异步任务都压成一一个同步任务，在下一个tick 执行完毕。

`附加`

noop 的定义如下

```js
/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop(a?: any, b?: any, c?: any) {}
```

## 使用方式

- 语法：[Vue.nextTick( [callback, context\] )]
- **参数**：
  - `{Function} [callback]`：回调函数，不传时提供 promise 调用
  - `{Object} [context]`：回调函数执行的上下文环境，不传默认是自动绑定到调用它的实例上。

```js
//改变数据
vm.message = "changed"

//想要立即使用更新后的DOM。这样不行，因为设置message后DOM还没有更新
console.log(vm.$el.textContent) // 并不会得到'changed'

//这样可以，nextTick里面的代码会在DOM更新后执行
Vue.nextTick(function () {
  // DOM 更新了
  //可以得到'changed'
  console.log(vm.$el.textContent)
})

// 作为一个 Promise 使用 即不传回调
Vue.nextTick().then(function () {
  // DOM 更新了
})
```

Vue实例方法vm.$nextTick 做了进一 步封装，把context 参数设置成当前Vue实例。

使用Vue .nextTick()是为了可以获取更新后的DOM。触发时机: 在同一事件 循环中的数据变化后， DOM完成更新， 立即执行Vue .nextTick()的回调 。

> 同一事件循环中的代码执行完毕-> DOM更新-> nextTick callback 触发。

## 使用场景

在Vue生命周期的created()鈎子函数迸行的DOM操作-定要放在Vue .nextTick( )的回凋函数中。原因:是created()鈎子函数抗行肘DOM其突并未迸行渲染。

在数据変化后要抗行的某个操作，而込个操作需要使用随数据改変而改変的DOM結枸的吋候，这个操作应该放在Vue .nextTick()的回調函数中。原因: Vue异步执行DOM更新，只要双察到数据変化，Vue將开启一个队列，并緩冲在同一事件循坏中友生的所有数据改変，如果同一个watcher 被多次触岌，只会被推入到臥列中一次。

## 总结

- Vue的nextTick 其本质是对JavaScript 执行原理EventLoop的一种应用
- nextTick的核心利用了如Promise、MutationObserver 、setlmmediate、setTimeout的原生JavaScript方法来模拟对应的微/宏任务的实现，本质是为了利用JavaScript 的这些异步回调任务队列来实现Vue框架中自己的异步回调队列
- nextTick不仅是Vue 内部的异步队列的调用方法，同时也允许开发者在实际项目中使用这个方法来满足实际应用中对Dom更新数据时机的后续逻辑处理
- nextTick是典型的将底层JavaScript 执行原理应用到具体案例中的示例
  引入异步更新队列机制的原因:
  - 如果是同步更新，则多次对一个或多个属性赋值，会频繁触发U/Dom的渲染，可以减少-些无用渲染
  - 同时由于VirtualDOM 的引入，每次状态 发生变化后，状态变化的信号会发送给组件，组件内部使用VirtualDOM 进行计算得出需要更新的具体的DOM节点，然后对DOM进行更新操作，每次更新状态后的渲染过程需要更多的计算，而这种无用功也将浪费更多的性能，所以异步渲染变得更加至关重要

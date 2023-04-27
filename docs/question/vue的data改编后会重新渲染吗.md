---
title: vue 中data中某个属性改变会触发视图重新渲染的吗
date: 2021-08-03
tags:
 - question
categories:
 - 问题积累
---



## 答案及解析

不会。

Vue实现响应式并不是数据发生变化之后DOM立即变化，而是按一定的策略进行 DOM的更新。

Vue在更新DOM时是异步执行的。只要侦听到数据变化，Vue将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。
如果同一个watcher被多次触发，只会 被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作是非常重要的。

然后，在下一个的事件循环tick中，Vue 刷新队列并执行实际(已去重的)工作。 



## 其他相关

### 异步执⾏的运⾏机制

1. 所有同步任务都在主线程.上执行，形成一个执行栈(execution context stack) 。
2. 主线程之外，还存在一个"任务队列”(task queue)。只要异步任务有了运行结果，就在" 任务队列"之中放置一个事件。
3. 一 旦”执行栈”中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
4. 主线程不断重复上面的第三步

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-08-03-152604.png)

#### 事件循环说明

简单来说，vue 在修改数据后，视图不会⽴刻更新，⽽是等同⼀事件循环中的所有数据变化完成之后，再统⼀进⾏视图更新。

```js
// 改变数据
vm.message = "changed";

// 想要立即使用更新后的dom,这样不行，因为设置message后dom还没更新。
console.log(vm.$el.textConteng);// 并不会得到changed

// 这样可以，nextTck里面的代码会在dom更新后执行
Vue.nextTick(function(){
    console.log(vm.$el.textConteng); // 可以得到changed
})
```

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-08-03-152707.png)

#### 事件循环：

`1)第一个tick`
图例中第一个步骤，即'本次更新循环'

首先修改数据，这是同步任务。同一事件循环的所有的同步任务都在主线程上执行，形成一个执行栈，此时还未涉及DOM。 

Vue开启一个异步队列，并缓冲在此事件循环中发生的所有数据改变。如果同一个watcher被多次触发，只会被推入到队列中一次。
`2)第二个tick`
图例中第二个步骤，即'下次更新循环'

同步任务执行完毕，开始执行异步watcher 队列的任务，更新DOM。Vue在内部尝试对异步队列使用原生的Promise . then和MessageChannel方法，如果执行环境不支持，会采用setTimeout(fn, 0) 代替。
`3)第三个tick`
此时就是文档所说的下次DOM更新循环结束之后

此时通过Vue . nextTick获取到改变后的DOM。通过set Timeout(fn ,0)也可以同样获取到。
`总结`
同步代码执行-> 查找异步队列，推入执行栈，执行Vue .nextTick[事件循环1] ->查找异步队列，推入执行栈，执行Vue .nextTick [事件循环2]...

总之，异步是单独的一个tick，不会和同步在一个tick 里发生，也是DOM不会马上改变的原因。

### 更新原理解读

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-08-03-153021.png)

- 当我们把对象传入Vue 实例作为data 选项，Vue会遍历此对象所有的property, 并使用Object. defineProperty 把这些property全部转为getter/setter。
- 每个组件实例都对应一个watcher 实例，它会在组件渲染的过程中把“接触”过的数据property记录为依赖。
- 当data的某个值发生改变之后， 就会触发实例 setter,同时通知watcher, 使它关联的组件重新渲染视图。

#### 简易原理

```js
// 数据变化渲染视图
function renderView() {
  console.log("render view");
}
// 数据劫持
function defineReactive(target, key, value) {
  observe(value);
  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(newVal) {
      if (newVal !== value) {
        observe(newVal);
        value = newVal;
        // 触发视图更新
        renderView();
      }
    },
  });
}
function observe(target) {
  // 不是对象直接返回
  if (typeof target !== "object" || target === null) {
    return target;
  }
  // 递归遍历对象，数据劫持
  for (let key in target) {
    defineReactive(target, key, target[key]);
  }
}
let data = { name: "小王" };
const reactiveData = observe(data);
data.name = "老王";
// render view
```

#### 对于数组，vue是可以对数组进行更新的

重写了数组的方法，下面是简易版：

```js
const prototype = Array.prototype;
const newProto = Object.create(prototype);
const methods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];
methods.forEach((method) => {
  newProto[method] = () => {
    newProto[method].call(this, ...args);
    renderView();
  };
});
```

#### Object.defineProperty存在的问题

1. 无法对原生数组进行更新

2. 对象嵌套是，递归消耗部分性能

3. 无法对新添加的属性进行监听

#### Proxy

```js
function defineReactive(target) {
  if (typeof target !== "object" || target == null) {
    return target;
  }
  const handler = {
    get(target, property, receiver) {
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value) {
      if (val !== target[property]) {
        renderView();
      }
      return Reflect.set(target, property, value);
    },
  };
  return new Proxy(target, handler);
}

// 数据响应式监听
const reactiveData = defineReactive(data)
```

proxy解决的问题

- Proxy支持监听原生数组
- Proxy的获取数据，只会递归到需要获取的层级，不会继续递归
- 可对新添加的属性监听
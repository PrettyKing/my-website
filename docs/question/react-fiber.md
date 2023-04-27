---
title: react的react-fiber
date: 2021-08-14
tags:
 - question
categories:
 - 问题积累
---

### 一、背景

- react在进行组件渲染时，从setState开始到渲染完成整个过程是同步的(“一 气呵成”) 。如果 需要渲染的组件比较庞大， js执行会占据主线程时间较长， 会导致页面响应度变差， 使得react在动画、手势等应用中效果比较差。
- 页面卡顿: Stack reconciler的工作流程很像函数的调用过程。父组件里调子组件，可以类比为函数的递归;对于特别庞大的vDOM树来说，recnciliation 过程会很长(x00ms),超过16ms,在这期间，主线程是被js占用的，因此任何交互、布局、渲染都会停止， 给用户的感觉就是页面被卡住了。

### 二、实现原理

> 旧版React通过递归的方式进行渲染，使用的是JS引擎自身的函数调用栈，它会一直执行到栈空为止。 而Fiber 实现了自己的组件调用栈，它以链表的形式遍历组件树，可以灵活的暂停、继续和丢弃执行的任务。实现方式是使用了浏览器的requestldleCallback 这一API。 Fiber 其实指的是一种数据结构， 它可以用一个纯JS对象来表示:

``` js
const fiber = {
  stateNode, // 节点实例
  child, // 子节点
  sibling, // 兄弟节点
  return, // 父节点
};
```

- react内部运转分三层:
  - Virtual DOM层，描述页面长什么样。
  - Reconciler层，负责调用组件生命周期方法，进行Diff运算等。
  - Renderer层，根据不同的平台，渲染出相应的页面，比较常见的是ReactDOM和ReactNative.
- 为了实现不卡顿，就需要有个调度器(Scheduler) 来进行任务分配。优先级高的任务(如键盘输入)可以打断优先级低的任务 (如Diff 的执行， 从而更快的生效。任务的优先级有六种:
  - synchronous, 与之前的Stack Reconciler操作一样，同步执行
  - task, 在next tick之前执行
  - animation, 下一帧之前执行
  - high,在不久的将来立即执行
  - low,稍微延迟执行也没关系
  - offscreen, 下一次render 时或scroll 时才执行
- Fiber Reconciler (react )执行阶段:
  - 阶段一，生成Fiber树，得出需要更新的节点信息。这一步是一个渐进的过程，可以被打断。
  - 阶段二，将需要更新的节点一次过批量 更新，这个过程不能被打断。
- Fiber 树: React 在render 第次渲染时，会通过React.createElement 创建一颗Element 树，可以称之为 Virtual DOM Tree,由于要记录上下文信息，加入了 Fiber,每一个Element会对应一个Fiber Node,将Fiber Node链接起来的结构成为Fiber Tree。Fiber Tree一个重要的特点是链表结构，将递归遍历编程循环遍历，然后配合requestldleCallback API,实现任务拆分、中断与恢复。
- 从Stack Reconciler到Fiber Reconciler,源码层面其实就是干了件递归改循环的事情
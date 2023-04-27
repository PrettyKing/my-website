---
title: vue中的dom diff算法
date: 2021-07-26
tags:
 - question
categories:
 - 问题积累
---

## 一、Diff算法

Diff算法是种通过同层的树节 点进行比较的高效算法，避免对树的逐层遍历， 减少时间复杂度。diff算法在很多场景 下都有用，比如vue 虚拟dom 渲染生成真实dom的新旧VNonde比较更新。

diff算法两个特点:

- 只会同级比较，不跨层级
- diff比较循环两边往中间收拢，

## 二、Vue Diff算法

`vue的虚拟domdiff 核心在于patch 过程`

### 2.1首先将新旧VNode进行开始位置和结束位置的标记

```js
let oldStartIndex = 0;
let oldEndIndex = oldChildren.length - 1;
let oldStartVnode = oldChidren[0];
let oldEndVnode = oldChildren[oldEndIndex];
let newStartIndex = 0;
let newEndIndex = newChildren.length - 1;
let newStartVnode = newChildren[0];
let newEndVnode = newChildren.length;
```

### 2.2标记好节点位置，进行循环处理节点

- 如果当前oldStartVnode和newStartVnode节点相同，直接用新节点复用老节点，进行patchVnode 复用，更新oldStartVnode, newStartVnode, oldStartIndex++和newStartIndex++
- 如果当前oldEndVnode 和newEndVnode 节点相同，直接用新节点复用老节点，进行patchVnode 复用，更新oldEndVnode, newEndVnode, oldEndIndex-- 和newEndIndex--
- 如果当前oldStartVnode和newEndVnode节点相同，直接用新节点复用老节点，进行patchVnode复用，将将老节点移动到oldEndVnode 节点之后，，更新 oldStartVnode, newEndVnode, oldStartIndex++ 和newEndIndex-- 
- 如果当前oldEndVnode和newStartVnode 节点相同，直接用新节点复用老节点，进行patchVnode复用，将复用老节点移动oldStartVnode 的elm之前，，更新 oldStartVnode, newEndVnode, oldEndIndex-- 和newStartIndex--
- 如果都不满足则没有相同节点复用，进行key的对比。满足条件进行patchVnode 过程，并将dom移动到oldStartVnode 对应真是dom之前。没找到则重新创

### 2.3递归处理

## 三、Vue Diff 图解

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-26-124342.png)

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-26-124501.gif)

- 第一步:创建四个指针， 分别为旧VNode的开始指针和结束指针、新VNode的开始和结束指针
- 第二步:先比较旧 VNode的开始指针和新VNode的开始指针，即A和E，发现不是同一个节点
- 第三步:再比较旧VNode的结束指针和新VNode的结束指针，即D和F，依然不是相同节点
- 第四步:再比较旧 VNode的开始指针和新VNode的结束指针，即A和F，不是相同节点
- 第五步:再比较旧 VNode的结束指针和新VNode的开始指针，即E和D，不是相同节点
- 第六步:通过 上述四种比对方式都不是相同节点，下面就在旧 VNode节点中查找是否有与E节点相同的节点
- 第七步:发现旧 VNode节点中没有E节点，那么就会在旧VNode开始指针前插入一个新的E节点
- 第八步:第一个节点操作完后， 指针后移，继续进行比较，重复第二至第七步， 结果为:新增、删除、移动
- 第九步:当找到相同节 点时，会通过patchVnode 进行这两个节点更细致的Diff

总结

每次Diff都会调用updateChildren 方法来比较，就这样层层递归下去，直到将旧VNode和新VNode中的所有子节点比对完。DomDiff 的过程更像是两个树的比较，每找到相同节点时，都会层-层的往 下比较它们的子节点， 是一个深度递归遍历比较 的过程。


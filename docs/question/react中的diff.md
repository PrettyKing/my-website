---
title: react diff算法
date: 2021-11-1
tags:
 - question
categories:
 - 问题积累
---



React通过引入Virtual DOM的概念， 极大地避免无效的Dom操作，已使我们的页面的构建效率提到了极大的提升。但是如何高效地通过对比新旧Virtual DOM来找出真正的Dom变化之处同样也决定着页面的性能，React用其特殊的diff算法解决这个问题。Virtual DOM+React dif的组合极大地保障了React的性能， 使其在业界有着不错的性能口碑。dif算法并非React首创，React只是对diff算法做了一个优化，但却是因为这个优化，给React带 来了极大的性能提升，其中的react中的dom diff的策略如下：

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-11-01-051342.png)

1. Web UI中DOM节点跨层级的移动操作特别少，可以忽略不计。
2. 拥有相同类的两个组件将会生成相似的树形结构，拥有不同类的两个组件将会生成不同的树形结构。
3. 对于同一层级的一组子节点，它们可以通过唯一id进行区分。

#### 基于以上三个前提策略，React 分别对tree diff、 component diff 以及element diff 进行算法优化。

1) tree diff
基于策略1，React 对树的算法进行了简洁明了的优化，即对树进行分层比较，两棵树只会对同一层次的节点进行比较。由于DOM节点跨层级的移动操作少到可以忽略不计，针对这现象，React 通过updateDepth 对Virtual DOM树进行层级控制，只会对同一个父节点下的所有子节点进行比较。当发现节点已经不存在，则该节点及其子节点会被完全删除掉，不会用于进步的比较。 这样只需要对树进行一 次遍历，便能完成整个DOM树的比较。
2) component diff
React是基于组件构建应用的，对于组件间的比较所采取的策略也是简洁高效。
- 如果是同一类型的组件，按照原策略继续比较virtual DOM tree。
- 如果不是，则将该组件判断为dirty component, 从而替换整个组件下的所有子节点。
- 对于同一类型的组件，有可能其Virtual DOM没有任何变化，如果能够确切-的知道这点那可以节省大量的diff 运算时间，因此React允许用户通过shouldComponentUpdate() 来判断该组件是否需要进行dif

3) element diff
  当节点处于同一层级时，React diff 提供了三种节点操作，分别为: INSERTMARKUP (插入)、MOVEEXISTING (移
  动)和REMOVE_ NODE (删除)。
  - INSERT_ .MARKUP,新的component类型不在老集合里，即是全新的节点， 需要对新节点执行插入操作。
  - MOVE_ EXISTING, 在老集合有新component 类型，且element 是可更新的类型，generateComponentChildren 已调用receive Component,这种情况下preChild=nextChild, 就需要做移动操作，可以复用以前的DOM节点。
  - REMOVE_ NODE,老component类型，在新集合里也有，但对应的element不同则不能直接复用和更新，需要执行删除操作，或者老component不在新集合里的，也需要执行删除操作。

允许开发者对同一层级的同组子节点，添加唯一key进行区 分
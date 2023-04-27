---
title: vue 中所有带$方法的说明
date: 2021-06-24
tags:
 - question
categories:
 - 问题积累
---



## 实例 Property

- `vm.$data` : Vue 实例观察的数据对象。Vue实例代理了对其data 对象property 的访问。
- `vm.$props` : 当前组件接收到的props 对象。Vue实例代理了对其props 对象property 的访问。
- `vm.$el` : Vue 实例使用的根DOM元素。
- `vm.$options` :用于当前Vue实例的初始化选项。需要在选项中包含自定义property 时会有用处:
- `vm.$parent` :父实例，如果当前实例有的话。
- `vm.$root`:当 前组件树的根Vue实例。如果当前实例没有父实例，此实例将会是其自己。
- `vm.$children` : 当前实例的直接子组件。需要注意`$children` 并不保证顺序， 也不是响应式的。如果你发现自己正在尝试使用`$children`来进行数据绑定， 考虑使用一个数组配合v-for来生成子组件， 并且使用Array 作为真正的来源。
- `vm.$slots` :用来访问被插槽分发的内容。每个具名插槽有其相应的property (例如:`v-slot:foo`中的内容将会在`vm.$slots.foo`中被找到)。 default property 包括了所有没有被包含在具名插槽中的节点，或`v-slot:default`的内容 。
- `vm.$scopedslots` :用来访问作用域插槽。对于包括默认slot在内的每一个插槽，该对象都包含一个返回相应VNode的函数。
- `vm.$refs` :一个对象，持有注册过ref ttribute 的所有DOM元素和组件实例。
- `vm.$isServer` :当前Vue实例是否运行于服务器。
- `vm.$attrs` :包含了父作用域中不作为prop 被识别(且获取)的attribute 绑定(class 和style 除外)。当一个组件没有声明任何prop 时，这里会包含所有父作用域的绑定(class 和 style除外)，并且可以通过`v-bind="$attrs"` 传入内部组件一 在创建高级别的组件时非常有用。
- `vm.$listeners` :包含了父作用域中的(不含. native修饰器的) v-on 事件监听器。它可以通过`v-on="$listeners"`传入内部组件一 在 创建更高层次的组件时非常有用。

## 实例方法/数据

- `vm.$watch( expOrFn, callback, [options] )` :观察Vue实例上的一个表达式或者一个函数计算结果的变化。回调函数得到的参数为新值和旧值。表达式只接受简单的键路径。对于更复杂的表达式，用一个函数取代。
- `vm.$set( target, propertyName/index,value )` :这是全局Vue .set的别名 。
- `vm.$delete( target, propertyName/index)`:这是全局Vue .delete的别名。

## 实例方法/事件

- `vm.$on( event, callback )` :监听当前实例上的自定义事件。事件可以由`vm. $emit`触发。 回调函数会接收所有传入事件触发函数的额外参数。
- `vm.$once( event, callback )`:监听一个自定义事件，但是只触发一次。-旦触发之后，监听器就会被移除。
- `vm.$off( [event, callback] )` :移除自定义事件监听器。
- `vm.$emit( eventName, [.args] )` : 触发当前实例上的事件。附加参数都会传给监听器回调。

## 实例方法/生命周期

-  `vm.$mount( [ elementorSelector] )` :如果Vue实例在实例化时没有收到el选项，则它处于“未挂载”状态，没有关联的DOM元素。可以使用`vm . $mount( )`手 动地挂载一个未挂载的实例。这个方法返回实例自身，因而可以链式调用其它实例方法。
- `vm.$forceUpdate()` :迫使Vue实例重新渲染。注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。
- `vm.$nextTick( [callback] )` :将回调延迟到下次DOM更新循环之后执行。在修改数据之后立即使用它，然后等待DOM更新。它跟全局方法Vue .nextTick 一样，不同的是回调的this 自动绑定到调用它的实例上。
- `vm.$destroy()` :完全销毁一个实例。 清理它与其它实例的连接，解绑它的全部指令及事件监听器。
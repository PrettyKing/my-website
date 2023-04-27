---
title: vue 中的v-model
date: 2021-08-04
tags:
 - question
categories:
 - 问题积累
---



## v-model的语法糖

指计算机语言中添加的某种语法，这种语法对语言的功能并没有影响，但是更方便程序员使用。通常来说使用语法糖能够增加程序的可读性，从而减少程序代码出错的机会。糖在不改变其所在位置的语法结构的前提下，实现了运行时的等价。可以简单理解为，加糖后的代码编译后跟加糖前一样，代码更简洁流畅，代码更语义自然。

## 实现原理

### 1.作用在普通表单元素上

动态绑定了input 的value 指向 了messgae 变量， 并且在触发input 事 件的时候去动态把message 设置为目标值

```vue
<input v-model="sth" />
//  等同于
<input 
    v-bind:value="message" 
    v-on:input="message=$event.target.value"
>
//$event 指代当前触发的事件对象;
//$event.target 指代当前触发的事件对象的dom;
//$event.target.value 就是当前dom的value值;
//在@input方法中，value => sth;
//在:value中,sth => value;
```

### 2.作用在组件上

在自定义组件中，v-model 默认会利用名为value 的prop 和名为input 的事件。

本质是个父子组件通信的语法糖，通过prop和$emit实现。

因此父组件v-model语法糖本质上可以修改为` <child :value= ”message" @input= ”function(e) {message = e}"></child>`在组件的实现中，我们是可以通过v-model属性 来配置子组件接收的prop名称，以及派发的事件名称。

例子

```vue
// 父组件
<aa-input v-model="aa"></aa-input>
// 等价于
<aa-input v-bind:value="aa" v-on:input="aa=$event.target.value"></aa-input>

// 子组件：
<input v-bind:value="aa" v-on:input="onmessage"></aa-input>

props:{value:aa,}
methods:{
    onmessage(e){
        $emit('input',e.target.value)
    }
}
```

默认情况下，一个组件上的v-model 会把value 用作prop 且把input 用作event，但是一些输入 类型比如单选框和复选框按钮可能想使用value prop 来达到不同的目的。使用model 选项可以回避这些情况产生的冲突。

js 监听input输入框输入数据改变，用oninput ,数据改变以后就会立刻出发这个事件。

通过input事件把数据semit出去，在父组件接受。

父组件设置v-model的值为inputsemit过来的值。
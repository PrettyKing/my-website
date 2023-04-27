---
title: 对react的看法，它的优缺点，使用过程中遇到的问题，如何解决的
date: 2021-06-15
tags:
 - question
categories:
 - 问题积累
---

## React
> ReactJS是一套JavaScript Web庠，由Facebook打 造而成且主要用于枸建高性能及吶座式用戸界面。遵循組件设计模式、声明式編程范式和函数式編程概念，以使前端座用程序更高效。它用虚似DOM来有效地操作DOM。遵循単向数据流，让状态管理更加可控。
>
> ReactJS并不是一个完整的MVC框架，最多可以认为是MVC中的V (View) 。在Web开发中，我們需要將変化的数据实时反映到UI上，这时就需要対DOM的操作。而复杂頻繁的操作通常是性能瓶颈发生的原因。React内此引入了虚拟DOM (Virtual DOM)的机制，在渕覧器端用Javascript实现一套DOM APl. 基于React迸行开发时所有的DOM构造都是通过虚拟DOM迸行，毎当数据変化吋，Rea都会重新构建整个DOM数，然后React將 当前整个DOM柎和上-次的DOM树迸行対比，得到DOM结构的区別，然后仅仅將需要変化的部分迸行实际的浏览器DOM更新。

## 优点

### 2.1React速度快

与其他的框架相比，React采用了一种独立独行的操作DOM的方式，它并不直接对DOM进行操作，它引入了一个叫虚拟DOM的概念，安插在JavaScript逻辑和实际的DOM之间。这一概念提高了Web性能。在UI渲染过程中，React通过在虚拟DOM中的微操作实现对现实际DOM的局部更新。

### 2.2 跨浏览器兼容

虚拟DOM帮助我们解决了跨浏览器问题，它为我们]提供了标准化的API,甚至在IE8中都是没问题的
### 2.3模块化
程序编写独立的模块化UI组件，这样当某个或某些组件出现问题是，可以方便地进行隔离。
每个组件都可以进行独立的开发和测试，并且它们可以引入其它组件。这等同于提高了代码的可维护性。

### 2.4单向数据流
Flux是一个用于在JavaScript应用中创建单向数据层的架构，它随着React视图库的开发而被Facebook概念化。它只是一个 概念，而非特定工具的实现。它可以被其它框架吸
纳。

### 2.5同构的JavaScript

单页面JS应用程序的最大缺陷在于对搜索引擎的索引有很大限制。React对此有 了解决方案。
React可以在服务器上预渲染应用再发送到客户端。它可以从预渲染的静态内容中恢复-样的记录到动态应用程序中。
因为搜索引擎的爬虫程序依赖的是服务端响应而不是JavaScript的执行，预渲染你的应用有助于搜索引擎优化。

## 缺点

### 3.1只是View层、

React本身只是一个V而已，并不是个完整的框架， 所以如果是大型项目想要一套完整的框架的话， 基本都需要加上ReactRouter和Flux...才 能写大型应用

### 3.2状态不同步

函数的运行是独立的，每个函数都有-份独立的作用域。函数的变量是保存在运行时的作用域里面，当我们有异步操作的时候，经常会碰到异步回调的变量引用是之前的，也就是旧的(这里也可以理解成闭包)

```jsx
import React, { useState } from "react";
const Counter = () => {
 const [counter, setCounter] = useState(0);
 const onAlertButtonClick = () => {
   setTimeout(() => {
     alert("Value: " + counter);
   }, 3000);
 };
 return (
   <div>
     <p>You clicked {counter} times.</p>
     <button onClick={() => setCounter(counter + 1)}>Click me</button>
     <button onClick={onAlertButtonClick}>
       Show me the value in 3 seconds
     </button>
   </div>
 );
};
export default Counter;
```

当你点击Show me the value in 3 seconds 的后，紧接着点击Click me使得counter的值从0变成1。三秒后，定时器触发，但alert出来的是0 (旧值)，但我
们希望的结果是当前的状态1。这个问题在class component不会出现， 因为class component 的属性和方法都存放在一个instance上，调用方式是: this.state.xxx 和this.method()。因为每次都是从一个不变的instance上 进行取值，所以不存在引用是旧的问题。
##### **解决**
其实解决这个hooks的问题也可以参照类的instance 。用useRef 返回的immutable Refobject ( current属性是可变的)来保存state然后取值方式从counter变成了: counterRef. current,如下:

```jsx
import React, { useState, useRef, useEffect } from "react";
const Counter = () => {
  const [counter, setCounter] = useState(0);
  const counterRef = useRef(counter);
  const onAlertButtonClick = () => {
    setTimeout(() => {
      alert("Value: " + counterRef.current);
    }, 3000);
  };
  useEffect(() => {
    counterRef.current = counter;
  });
  return (
    <div>
      <p>You clicked {counter} times.</p>
      <button onClick={() => setCounter(counter + 1)}>Click me</button>
      <button onClick={onAlertButtonClick}>
        Show me the value in 3 seconds
      </button>
    </div>
  );
};
export default Counter;
```

结果如我们所期待，alert的是当前的值1。
我们可以把这个过程封装成个custom hook,如下:

```jsx
import { useEffect, useRef, useState } from "react";
const useRefState = <T>(initialValue: T):
 [T, React.MutableRefObject<T>, 
   React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
};
export default useRefState;
```

尽管这个问题被巧妙地解决了，但它不优雅、hack 味道浓，且丢失了函数编程风格。怎么避免react hooks 的常见问题:

1. 不要在useEffect 里面写太多的依赖项，划分这些依赖项成多个单一功能的useEffect。其实这点是遵循了软件设计的“单一职责模式”。

2. 如果你碰到状态不同步的问题， 可以考虑下手动传递参数到函数。如:

   ```jsx
   // showCount的count来自父级作用域 
      const [count,setCount] = useState(xxx); 
      function showCount(){ 
        console.log(count) 
      } 
      // showCount的count来自参数 
      const [count,setCount] = useState(xxx); 
      function showCount(c){ 
        console.log(c) 
      }
      //但这个也只能解决一部分问题， 很多时候你不得不使用上述的useRef方案。
   ```


3. 重视eslint -plugin-react-hooks 插件的警告。

4. 复杂业务的时候，使用Component代替hooks。

## 使用过程中遇到的问题，如何解决的?

1. SPA应用，首屏时间过长，可以增加Loading态、 骨架屏、异步加载、SSR等方法解决
2. 父节点状态更新会导致无关子节点也会更新，使用shouldComponentUpdate 、 PureComponent 、 React.memo 等方式避免没有必要的渲染
3. setState并非都是同步执行， 所以需要注意setState 的状态 更新、多次setState会被忽略等问题;另外object类型的state更新需要注意引用问题
4. 复杂组件state难于管理难于追踪，应尽量避免使用state, 可以使用Redux等方式统一 管理state

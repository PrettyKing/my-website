---
title: 元编程
date: 2021-04-30
author: 卫辰
---



## 元编程的基础概念

> 元编程（Metaprogramming）是指某类[计算机程序](https://baike.baidu.com/item/计算机程序/3220205)的编写，这类计算机程序编写或者操纵其他[程序](https://baike.baidu.com/item/程序/13831935)（或者自身）作为它们的数据，或者在运行时完成部分本应在[编译](https://baike.baidu.com/item/编译/1258343)时完成的工作。很多情况下与手工编写全部代码相比工作效率更高。编写元程序的语言称之为[元语言](https://baike.baidu.com/item/元语言/8251488)，被操作的语言称之为[目标语言](https://baike.baidu.com/item/目标语言/88379)。一门语言同时也是自身的元语言的能力称之为反射。

简单理解为：一般代码的操作对象是数据；元编程操作的对象是其他代码。



## js中的元编程

> 从ECMAScript 2015 开始，JavaScript 获得了 **Proxy** 和 **Reflect** 对象的支持，允许你拦截并定义基本语言操作的自定义行为（例如，属性查找，赋值，枚举，函数调用等）。借助这两个对象，你可以在 JavaScript 元级别进行编程。



## 代理(proxy)

在 ECMAScript 6 中引入的 [`Proxy`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)操作并实现自定义行为。例如获取一个对象上的属性：

``` javascript
let handler = {
  get: function(target, name){
    return name in target ? target[name] : 42;
}};

let p = new Proxy({}, handler);
p.a = 1;

console.log(p.a, p.b); // 1, 42

//Proxy 对象定义了一个目标（这里是一个空对象）和一个实现了 get 陷阱的 handler 对象。这里，代理的对象在获取未定义的属性时不会返回 undefined，而是返回 42。
```

:::  warning

 在讨论代理的功能时会用到以下术语:

- Handler:包含陷阱的占位符对象。
- traps:提供属性访问的方法。这类似于操作系统中陷阱的概念。
- target:代理虚拟化的对象。它通常用作代理的存储后端。根据目标验证关于对象不可扩展性或不可配置属性的不变量（保持不变的语义）。
- invariants:实现自定义操作时保持不变的语义称为不变量。如果你违反处理程序的不变量，则会抛出一个[`TypeError`]。

:::

## 反射(Reflect)

[`Reflect`] 是一个内置对象，它提供了可拦截 JavaScript 操作的方法。该方法和[`代理句柄`]类似，但 `Reflect` 方法并不是一个函数对象。

`Reflect` 有助于将默认操作从处理程序转发到目标。

以 [`Reflect.has()`]为例，你可以将 [`in` ]运算符]作为函数：

``` javascript
Reflect.has(Object, "assign"); // true
```

## 更好的 `apply` 函数

在 ES5 中，我们通常使用 Function.prototype.apply() 方法调用一个具有给定 this 值和 arguments 数组（或类数组对象）的函数：

```javascript
Function.prototype.apply.call(Math.floor, undefined, [1.75]);
```

使用 [`Reflect.apply`]，这变得不那么冗长和容易理解：

```javascript
Reflect.apply(Math.floor, undefined, [1.75]);
// 1;

Reflect.apply(String.fromCharCode, undefined, [104, 101, 108, 108, 111]);
// "hello"

Reflect.apply(RegExp.prototype.exec, /ab/, ['confabulation']).index;
// 4

Reflect.apply(''.charAt, 'ponies', [3]);
// "i"
```

## 检查属性定义是否成功

使用 [`Object.defineProperty`]，如果成功返回一个对象，否则抛出一个 [`TypeError`]，你将使用 [`try...catch`]错误。因为 [`Reflect.defineProperty`]返回一个布尔值表示的成功状态，你可以在这里使用`if ....else`块:

```javascript
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

## 实现 a==1 && a==2 && a==3

```javascript
let a = {
    [Symbol.toPrimitive]: ((i) => () => ++i)(0)
};

if (a == 1 && a == 2 && a == 3) {
    console.log('元编程')
}
```

重写valueOf/toString

```javascript
let b = {
    val: 1,
    valueOf() {
        return this.val++
    }
}

if (b == 1 && b == 2 && b == 3) {
    console.log('重写valueOf/toString ')
}
```

## 实现JS 负索引

```javascript
const negativeArray = (els) =>
    new Proxy(els, {
        get: (target, propKey, receiver) =>
            Reflect.get(
                target,
                +propKey < 0 ? String(target.length + +propKey) : propKey,
                receiver
            ),
    });
const unicorn = negativeArray(['我', '是', 'chalee', 'chen']);
console.log(unicorn[-1]);
```


---
title: BFC相关
date: 2021-07-15
tags:
 - question
categories:
 - 问题积累
---

## 什么是BFC？

BFC(Block formatting context)直译为"块级格式化上下文"。具有 BFC 特性的元素可以看作是隔离了的独立容器， 容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性。

## 触发BFC的条件

-  body 根元素
- 浮动元素：float 除 none 以外的值

- 绝对定位元素：position (absolute、fixed)
- display 为 inline-block、table-cells、flex

- overflow 除了 visible 以外的值 (hidden、auto、scroll)

## BFC有哪些用

1. BFC 可以解决边距重叠问题
2. BFC 可以解决浮动子元素导致父元素，高度坍塌的问题
3. BFC 可以解决文字环绕在float 四周的情况
4. 两栏自适应布局问题

## BFC边距重叠问题

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        .box1 {
            width: 100px;
            height: 100px;
            margin: 50px;
            background-color: #ff8000;
        }
        .box2 {
            width: 100px;
            height: 100px;
            margin: 50px;
            background-color: #ff0000;
        }
    </style>
</head>
<body>
    <div class="box1"></div>
    <div class="box2"></div>
</body>
</html>
```

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015041.png)

从图中我们可以看到,box1和box2的外边距已经重叠在一起了,这是因为他们处于同一个BFC里面.我们只需要把他们放在两个不同的BFC区域就行,比如给box2添加一个`display:inline-block`;就可以完美解决这个问题。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015130.png)

### BFC 浮动子元素导致父元素，高度坍塌的问题

我们在布局时经常会遇到这个问题：对子元素设置浮动后，父元素会发生高度塌陷，也就是父元素的高度变为0。解决这个问题，只需要把父元素变成一个BFC就行了。常用的办法是给父元素设置overflow:hidden。

```html
<style>
    .box1{
        width:100px;
        height:100px;
        float:left;
        border: 1px solid #000;
    }
    .box2{
        width:100px;
        height:100px;
        float:left;
        border: 1px solid #000;
    }
    .box{
        background:yellow
    }
</style>
<body>
    <div class="box">
        <div class="box1"></div>
        <div class="box2"></div>
    </div> 
</body>
```

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015308.png)

由于容器内两个div元素浮动，脱离了文档流，父容器内容宽度为零（即发生高度塌陷），未能将子元素包裹住。解决这个问题，只需要把把父元素变成一个BFC就行了。常用的办法是给父元素设置overflow:hidden。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015407.png)

### BFC 文字环绕在float 四周的情况

有时候一个浮动div周围的文字环绕着它（如下图中的左图所示）但是在某些案例中这并不是可取的，我们想要的是外观跟下图中的右图一样的。为了解决这个问题，我们可能使用外边距，但是我们也可以使用一个BFC来解决。

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015442.png)

```html
      <div class="container">
      <div class="floated">
         <img width="150px" src="https://user-gold-cdn.xitu.io/2020/4/18/1718da4f61a16e59?w=633&h=658&f=png&s=13693">
      </div>
      <p>YAMA YAMA YAMA YAMAYAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMAYAMA YAMA.
         YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMAYAMA YAMA
         YAMA YAMA
         YAMA YAMA YAMA YAMAYAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMAYAMA YAMA.
         YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMA YAMAYAMA YAMA
         YAMA YAMA.</p>
     </div>
<style>
      .floated {
         float: left;
         margin: 5px;
      }

      p {
         color: rgb(14, 13, 13);
         text-align: center;
         /* 解决方法如下 */
         /* overflow: hidden; */
      }
</style>
```

### 两栏自适应布局问题

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        .box1 {
            width: 100px;
            height: 100px;
            float: left;
            background-color: #ff8000;
        }

        .box2 {
            width: 200px;
            height: 200px;
            background-color: #ff0000;
        }
    </style>
</head>

<body>
    <div class="box1"></div>
    <div class="box2"></div>
</body>
</html>
```

代码效果：

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015651.png)

由于第一个盒子浮动了,第二个盒子没有浮动,所以出现了两个盒子重叠的现象,BFC的区域不会和float box进行重叠,我们给box2添加一个 `overflow:hidden` 就可以解决这个问题;

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-07-15-015842.png)


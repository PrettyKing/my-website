---
title: React 路由的动态加载模块，实现按需加载
date: 2021-06-16
tags:
 - question
categories:
 - 问题积累
---



## 为什么要动态加载模块

webpack在打包react 应用时会将整个应用打包成一个js 文件，当用户首次访问时，会加载整个js文件，当应用规模越来越大时，这个js 文件所包含的数据量也越来越大，网站首屏渲染的速度也就会变慢。

## 优化方法

常见的优化方法有一下3种:
1. 多入口:利用webpack 的entry配置多入口，将应用打包分割成多个js 文件。适用于多页面应用。
2. 去重:利用splitChunks去重，将公用的部分分离出来。
3. 路由动态加载:利用import( )方法细颗粒度的分割代码，将每一个路由到的组件从主bundle.js 文件分离出来。

这里主要介绍路由动态加载的方法，社区也有有较为成熟的第三方库react-loadable。

> 这里我们不使用第三方库来实现下。

- webpack支持ECMA提案的import()方法，它返回的是一个 promise对象，在webpack 打包的时候 会先遍历所有的import()方法，然后将每个 import() 的组件打包成独立的chunk, 与主bundle.js文件分离。

- 这样应用首屏渲染时加载的数据量就减少了，提高了首屏的速度。当路由跳转时，会异步加载相应的chunk。 然后配合ssr 技术有优化首屏加载的问题。

- 路由动态加载组件实现如下:

  ```jsx
  import * as React from "react";
  export default (loadComponent, loading = "加载中") => {
    return class AsyncComponent extends React.Component {
      state = {
        Child: null,
      };
      async componentDidMount() {
        const { Child } = await loadComponent();
        this.setState({ Child });
      }
      render() {
        const { Child } = this.state;
        return Child ? <Child {...this.props} /> : loading;
      }
    };
  };
  
  // router.js
  import AsyncComponent from "./component/AsyncComponent";
  
  export default [
    {
      name: "首页",
      path: "/",
      component: AsyncComponent(() => import("./pages/home")),
    },
    {
      name: "详情",
      path: "/detail",
      component: AsyncComponent(() => import("./pages/detail")),
    },
  ];
  //因为import()返回的是一个promise 对象，所以可以再componentDidMount 里使用await 来等待异步加载组件，整个实现就是利用高阶组件和import()方法。
  ```

  
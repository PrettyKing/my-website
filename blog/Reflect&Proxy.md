## Reflect

> ES6提供了一个全新的API-Reflect, Reflect 和Proxy是相对的，我们可以用Reflect 操作对象。

### Reflect存在的意义

- 将Object对象些内部的方法， 放到Reflect 对象上。比如Object.defineProperty

  > 现阶段这些方法存在于object 和Reflect 对象上，未来只存在于Reflect 对象上。
  
  意义:也就是说，从Reflect 对象上可以拿到语言内部的方法。
  
- 操作对象时出现报错返回false

    比如: object . def ineProperty (obj，name,desc)在无法定义属性时，会抛出一个错误，而Reflect . def ineProperty(obj , name , desc)则会返回false,这样会更合理一些。

    ```js
    // 旧写法
    try {
      Object.defineProperty(target, property, attributes);
    } catch (err) {
      //failure
    }
    
    // 新写法
    if (Reflect.defineProperty(target, property, attributes)) {
      //success
    } else {
      //failure
    }
    ```

- 保持和Proxy对象的方法一一对应

    > 说明: Reflect 对象的方法与Proxy 对象的方法一-对应，只要是Proxy对象的方法，就能在Reflect 对象上找到对应的方法。

    ```js
    Proxy(target, {
      set: function (target, name, value, receiver) {
        var success = Reflect.set(target, name, value, receiver);
        if (success) {
          console.log("property" + name + "on" + target + "set do " + value);
        }
        return success;
      },
    });
    ```

    这就让Proxy对象可以方便地调用对应的Reflect方法，完成默认行为，作为修改行为的基础。也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。

    > 综上所述: Reflect 对象有4个意义: 
    >
    > - 从Reflect对象上可以拿到语言内部的方法。
    > - 操作对象出现报错时返回false
    > - 让操作对象都变为函数式编程
    > - 保持和proxy对象的方法一-对 应

### 常用的API


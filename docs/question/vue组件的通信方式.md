---
title: vue组件的通信方式
date: 2021-07-24
tags:
 - question
categories:
 - 问题积累
---

## 父组件向子组件传值

 ### prop方式

可以是数组或对象，用于接收父组件的数据：

```html
<div id="app">
  	<child-component :msg="message" :count="count"></child-component>
  	<button @click="count++">
      点击+1
  	</button>
</div>
<script>
  const childComponent={
		props:{
      msg:String
      count:Number
    },
    template:`<div><p>{{msg}}</p><p>{{count}}</p><div>`
  }
	new Vue({
    el:'#app',
    data:{
      message:'父组件的值',
      count:0
    },
    components:{
      childComponent
    }
  })
</script>
```

### $parent方式

通过$parent获取父组件实例的方法或者属性。 这种方式，从严格意义上讲不是值的传递，而是一种“取”(不推荐直接通过实例进行值的获取)，使用：

>  实例属性$廀瀀廬擽婠攎可以获得父组件的实例，借助实例可以调用父实例中的方法，或者父实例上的属性

```html
<div id="app">
  	<child-component :msg="message" :count="count"></child-component>
  	<button @click="count++">
      点击+1
  	</button>
</div>
<script>
  //子组件
  const childComponent={
		data:()=>({
      msg:'',
      count:null
    }),
    methods:{
      handleClick(){
        //调用父级实例的方法
        this.$parent.parentMethods();
      }
    }
    mounted(){
      // 获取父级实例中的属性
      this.msg = this.$parent.message;
      this.count = this.$parent.count;
    }
    template:`<div><p @click="handleClick">{{msg}}</p><p>{{count}}</p><div>`
  }
  // 父级
	new Vue({
    el:'#app',
    data:{
      message:'父组件的值',
      count:0
    },
    methods:{
      parentMethod(){
        console.log('我是父级的方法');
      }
    }
    components:{
      childComponent
    }
  })
</script>
```

### .sync方式

(使用修饰符):修饰符 `.sync` 是 `2.3.0+` 新增，它对 `props` 起到了一种修饰的作用，使用 `.sync` 进行修饰的 `props` 意味子组件有修改它的意图，这种情况下它只起到一个标注性作用，有它没它都不会影响逻辑使用 `.sync` 修改上边的代码：

```vue
// 父组件 List.vue
<template>
  <!-- 这里不写 .sync 也不会影响结果 -->
  <List-item :title.sync="title" @update:title="updataTitle"></List-item>
</template>
<script>
import ListItem from "./ListItem";
export default {
  data() {
    return {
      title: "我是title",
    }
  },
  components: {
    ListItem
  },
  methods: {
   updataTitle(res) {
    this.title = res;
   }
  }
}
</script>

// 子组件 ListItem.vue
<template>
  <div>
    <button @click="handleClick">Click me</button>
    <div>{{title}}</div>
  </div>
</template>
<script>
export default {
  props: {
    title: String, 
  },
  methods: {
   handleClick() {
    // 子组件向父组件传值
    this.$emit('update:title', '我要父组件更新 title');
   }
  }
}
</script>
```

使用.sync 向子组件传递 多个props：

当我们用一个对象同时设置多个 `prop` 的时候，也可以将这个 `.sync` 修饰符和 `v-bind` 配合使用：

```vue
<text-document v-bind.sync="doc"></text-document>
```

这样会把 `doc` 对象中的每一个属性 (如 title) 都作为一个独立的 `prop` 传进去，然后各自添加用于更新的 `v-on`监听器。

## 子组件向父组件传值

### $emit方式

使用：

- 子组件使用$emit发送一个自定义事件
- 父组件使用指令v-on监听子组件发送的事件

``` html
<div id="app">
  	<child-component @child-event="childEvent"></child-component>
</div>
<script>
  //子组件
  const childComponent={
		data:()=>({
      msg:'点击发送值到父组件',
      count:null
    }),
    methods:{
      handleClick(data){
				this.$emit('child-event','我是子组件传过来的值');
      }
    }
    template:`<div><p @click="handleClick">{{msg}}</p><p>{{count}}</p><div>`
  }
  // 父级
	new Vue({
    el:'#app',
    data:{
      message:'父组件的值',
      count:0
    },
    methods:{
      childEvent(data){
				console.log("子组件传过来的值",data);
      }
    }
    components:{
      childComponent
    }
  })
</script>
```

### $children方式

获取子组件实例，同$parent方式

### ref方式

注册子组件引用，虽然存在prop和事件，但是有时仍可能需要在JavaScript里直接访问一个子组件。为了实现这样的需求，可以使用ref特性 为某个子组件设置一个ID引用，就是一 个 身份标识。

```html
<div id="app">
  	<child-component ref="childComponent"></child-component>
  	<button @click="getRefs">
      获取子组件实例
  	</button>
</div>
<script>
  //子组件
  const childComponent={
		data:()=>({
      msg:'点击发送值到父组件',
      count:null
    }),
    template:`<div><p @click="handleClick">{{msg}}</p><p>{{count}}</p><div>`
  }
  // 父级
	new Vue({
    el:'#app',
    data:{
      message:'父组件的值',
      count:0
    },
    methods:{
      getRefs(){
				console.log("子组件传过来的值",this.$refs.childComponent.msg);
      }
    }
    components:{
      childComponent
    }
  })
</script>
```

## 兄弟组件传值

### bus中央事件总线

非父子组件传值，可以使用-个空的Vue实力作为中央事件总线，结合实例方法$on, $​emit使用
注意:

> 注册的Bus要在组件销毁时卸载，否则会多次挂载，造成触发-次但多个响应的情况。

```js
beforeDestroy(){
  this.$Bus.$off('方法名',value);
}
```

Bus定义方式:

* 将Bus抽离出来，组件有需要时引入

```js
import Vue from 'vue';
const Bus = new Vue();
export default Bus;
```

* 将Bus挂载到vue根实例的原型上

```js
import Vue from 'vue';
Vue.prototype.$bus = new Vue();
```

* 将BUS注入到VUE根对象上

```js
import Vue form 'vue';
const Bus = new Vue();
new Vue({
  el:'#app',
  data:{
    Bus
  }
})
```

* use

```html
<div id="app">
  	<child-component ></child-component>
		<child-component-two ></child-component-two>
</div>
<script>
  Vue.prototype.$bus = new Vue();
  //子组件1 
  const childComponent={
		data:()=>({
      msg:'我是子组件一',
      sendMsg:'我是子组件一发送的值'
    }),
    methods:{
      handleClick(){
        this.$Bus.$emit('sendMsg',this.sendMsg);
      }
    }
    template:`<div><p @click="handleClick">{{msg}}</p></p><div>`
  }
  //子组件2
  const childComponentTwo={
		data:()=>({
      msg:'我是子组件二',
      brotherMsg:''
    }),
    mounted(){
      this.$Bus.$on('sendMsg',data=>{
        this.brotherMsg = data;
      })
    },
    beforeDestroy(){
      this.$Bus.$off('sendMsg');
    }
    template:`<div><p @click="handleClick">{{msg}}</p><p>{{brotherMsg}}</p><div>`
  }
  
  // 父级
	new Vue({
    el:'#app',
    data:{},
    components:{
      childComponent,
    	childComponentTwo
    }
  })
</script>
```

 ## 跨组件

###  `$attrs`和 `$listeners`
如果父组件A下面有子组件B,组件B下面有组件C，这时如果组件A直接想传递数据给组件C那就行不通了!所以这时可以使用`$attrs` 和`$listeners`。Vue 2.4提供了 `$attrs` 和`$listeners` 来实现能够直接让组件A传递消息给组件C。

```html
// 组件A
Vue.component('A', {
  template: `
    <div>
      <p>this is parent component!</p>
      <B :messagec="messagec" :message="message" v-on:getCData="getCData" v-on:getChildData="getChildData(message)"></B>
    </div>
  `,
  data() {
    return {
      message: 'hello',
      messagec: 'hello c' //传递给c组件的数据
    }
  },
  methods: {
    // 执行B子组件触发的事件
    getChildData(val) {
      console.log(`这是来自B组件的数据：${val}`);
    },
    
    // 执行C子组件触发的事件
    getCData(val) {
      console.log(`这是来自C组件的数据：${val}`);
    }
  }
});

// 组件B
Vue.component('B', {
  template: `
    <div>
      <input type="text" v-model="mymessage" @input="passData(mymessage)"> 
      <!-- C组件中能直接触发 getCData 的原因在于：B组件调用 C组件时，使用 v-on 绑定了 $listeners 属性 -->
      <!-- 通过v-bind 绑定 $attrs 属性，C组件可以直接获取到 A组件中传递下来的 props（除了 B组件中 props声明的） -->
      <C v-bind="$attrs" v-on="$listeners"></C>
    </div>
  `,
  /**
   * 得到父组件传递过来的数据
   * 这里的定义最好是写成数据校验的形式，免得得到的数据是我们意料之外的
   *
   * props: {
   *   message: {
   *     type: String,
   *     default: ''
   *   }
   * }
   *
  */
  props: ['message'],
  data(){
    return {
      mymessage: this.message
    }
  },
  methods: {
    passData(val){
      //触发父组件中的事件
      this.$emit('getChildData', val)
    }
  }
});

// 组件C
Vue.component('C', {
  template: `
    <div>
      <input type="text" v-model="$attrs.messagec" @input="passCData($attrs.messagec)">
    </div>
  `,
  methods: {
    passCData(val) {
      // 触发父组件A中的事件
      this.$emit('getCData',val)
    }
  }
});
    
var app=new Vue({
  el:'#app',
  template: `
    <div>
      <A />
    </div>
  `
});
```

### provide和inject

熟悉React开发的同学对Context API肯定不会陌生吧!在Vue中也提供了类似的API用于组件之间的通信。在父组件中通过 provider 来提供属性，然后在子组件中通过inject 来注入变量。不论子组件有多深，只要调用了inject 那么就可以注入在provider 中提供的数据，而不是局限于只能从当前父组件的prop属性来获取数据，只要在父组件的生命周期内，子组件都可以调用。这和React 中的Context API有没有很相似!

```html
// 定义 parent 组件
Vue.component('parent', {
  template: `
    <div>
      <p>this is parent component!</p>
      <child></child>
    </div>
  `,
  provide: {
    for:'test'
  },
  data() {
    return {
      message: 'hello'
    }
  }
});

// 定义 child 组件
Vue.component('child', {
  template: `
    <div>
      <input type="tet" v-model="mymessage"> 
    </div>
  `,
  inject: ['for'],	// 得到父组件传递过来的数据
  data(){
    return {
      mymessage: this.for
    }
  },
});

const app = new Vue({
  el: '#app',
  template: `
    <div>
      <parent />
    </div>
  `
});
```

上面的实例中，定义了组件parent 和组件child, 组件parent 和组件child 是父子关系。

* 在parent组件中，通过provide 属性，以对象的形式向子孙组件暴露了-些属性
* 在child 组件中，通过inject 属性注入了parent 组件提供的数据，实际这些通过inject 注入的属性是挂载到Vue实例上的，所以在组件内部可以通过this 来访问。

> 注意:官网文档提及provide 和inject 主要为高阶插件/组件库提供用例，并不推荐直接用于应用程序代码中。

### vuex状态管理

Vuex是状态管理工具，实现了项目状态的集中式管理。工具的实现借鉴了Flux、 Redux、 和The Elm Architecture 的模式和概念。当然与其他模式不同的是，Vuex 是专门为Vue.js 设计的状态管理库，以利用Vue.js 的细粒度数据响应机制来进行高效的状态更新。


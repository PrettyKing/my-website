---
title: vue keep-alive的实现
date: 2021-07-30
tags:
 - question
categories:
 - 问题积累
---



## 一、keep-alive

### Props

- include字符串或正则表达式，只有名称匹配的组件会被匹配
- exclude字符串或正则表达式。任何名称匹配的组件都不会被缓存。
- max数字。最多可以缓存多少组件实例
- keep-alive包裹动态组件时，会缓存不活动的组件实例

### 主要流程

1. 判断组件name，不在include或者在exclude中，直接返回vnode，说明该组件不被缓存。
2. 获取组件实例key，如果有获取实例的key，否则重新生成。
3. key生成规则， cid + "::"+ tag，仅靠cid是不够的的， 因为相同的构造函数可以注册为不同的本地组件。
4. 如果缓存对象内存在，则直接从缓存对象中获取组件实例给vnode，不存在则添加到缓存对象中。
  最大缓存数量，当缓存组件数量超过max值时，清除keys数组内第个组件。

## 二、keep-alive的实现

```typescript
const patternTypes: Array<Function> = [String, RegExp, Array] // 接收：字符串，正则，数组

export default {
  name: 'keep-alive',
  abstract: true, // 抽象组件，是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

  props: {
    include: patternTypes, // 匹配的组件，缓存
    exclude: patternTypes, // 不去匹配的组件，不缓存
    max: [String, Number], // 缓存组件的最大实例数量, 由于缓存的是组件实例（vnode），数量过多的时候，会占用过多的内存，可以用max指定上限
  },

  created() {
    // 用于初始化缓存虚拟DOM数组和vnode的key
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed() {
    // 销毁缓存cache的组件实例
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted() {
    // prune 削减精简[v.]
    // 去监控include和exclude的改变，根据最新的include和exclude的内容，来实时削减缓存的组件的内容
    this.$watch('include', (val) => {
      pruneCache(this, (name) => matches(val, name))
    })
    this.$watch('exclude', (val) => {
      pruneCache(this, (name) => !matches(val, name))
    })
  },
}
```

### render函数

1. 会在keep-alive 组件内部去写自己的内容，所以可以去获取默认slot的内容，然后根据这个去获取组件

2. keep-alive 只对第一个组件有效，所以获取第-个子组件。
3. 和keep-alive 搭配使用的一般有: 动态组件和router-view 

```typescript
render () {
  //
  function getFirstComponentChild (children: ?Array<VNode>): ?VNode {
    if (Array.isArray(children)) {
  for (let i = 0; i < children.length; i++) {
    const c = children[i]
    if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
      return c
    }
  }
  }
  }
  const slot = this.$slots.default // 获取默认插槽
  const vnode: VNode = getFirstComponentChild(slot)// 获取第一个子组件
  const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions // 组件参数
  if (componentOptions) { // 是否有组件参数
    // check pattern
    const name: ?string = getComponentName(componentOptions) // 获取组件名
    const { include, exclude } = this
    if (
      // not included
      (include && (!name || !matches(include, name))) ||
      // excluded
      (exclude && name && matches(exclude, name))
    ) {
      // 如果不匹配当前组件的名字和include以及exclude
      // 那么直接返回组件的实例
      return vnode
    }

    const { cache, keys } = this

    // 获取这个组件的key
    const key: ?string = vnode.key == null
      // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
      : vnode.key

    if (cache[key]) {
      // LRU缓存策略执行
      vnode.componentInstance = cache[key].componentInstance // 组件初次渲染的时候componentInstance为undefined

      // make current key freshest
      remove(keys, key)
      keys.push(key)
      // 根据LRU缓存策略执行，将key从原来的位置移除，然后将这个key值放到最后面
    } else {
      // 在缓存列表里面没有的话，则加入，同时判断当前加入之后，是否超过了max所设定的范围，如果是，则去除
      // 使用时间间隔最长的一个
      cache[key] = vnode
      keys.push(key)
      // prune oldest entry
      if (this.max && keys.length > parseInt(this.max)) {
        pruneCacheEntry(cache, keys[0], keys, this._vnode)
      }
    }
    // 将组件的keepAlive属性设置为true
    vnode.data.keepAlive = true // 作用：判断是否要执行组件的created、mounted生命周期函数
  }
  return vnode || (slot && slot[0])
}
```

keep-alive具体是通过cache数组缓存所有组件的vnode实例。当cache内原有组件被使用时会将该组件key从keys数组中删除，然后push到keys' 数组最后，以便清除最不常用组件。

### 步骤总结

1. 获取keep-alive下第一个 子组件的实例对象，通过他去获取这个组件的组件名
2. 通过当前组件名去匹配原来include 和exclude, 判断当前组件是否需要缓存，不需要缓存，直接返回当前组件的实例vNode

3. 需要缓存，判断他当前是否在缓存数组里面，存在，则将他原来位置上的key给移除，同时将这个组件的key放到数组最后面(LRU)
4. 不存在，将组件key放入数组，然后判断当前key 数组是否超过max所设置的范围，超过，那么削减未使用时间最长的一个组件的key值最后将这个组件的keepAlive设置为true

## 三、keep-alive本身的创建过程和patch 过程

缓存渲染的时候，会根据vnode . componentInstance (首次渲染vnode .componentInstance为undefined) 和keepAlive 属性判断不会执行组件的created、 mounted 等钩子函数，而是对缓存的组件执行patch 过程:`直接把缓存的DOM对象直接插入到目标元素中，完成了数据更新的情况下的渲染过程。`

### 首次渲染

- 组件的首次渲染:判断组件的abstract 属性，才往父组件里面挂载DOM:

```typescript
// core/instance/lifecycle
function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) { // 判断组件的abstract属性，才往父组件里面挂载DOM
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

- 判断当前keepAlive 和componentInstance是否存在来判断是否要执行组件prepatch 还是执行创建componentInstance

```typescript
// core/vdom/create-component
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) { // componentInstance在初次是undefined!!!
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode) // prepatch函数执行的是组件更新的过程
    } else {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
```

prepatch操作就不会在执行组件的mounted和created生命周期函数，而是直接将DOM插入

## 四、LRU (least recently used)缓存策略

`LRU缓存策略:` 从内存中找出最久未使用的数据并置换新的数据.

LRU (Least rencently used)算法根据数据的历史访问记录来进行淘汰数据，其核心思想是”如果数据最近被访问过，那么将来被访问的几率也更高”。最 常见的实现是使用一个链表保存缓存数据，详细算法实现如下:

1. 新数据插入到链表头部
2. 每当缓存命中(即缓存数据被访问)
3. 则将数据移到链表头部
4. 链表满的时候，将链表尾部的数据丢弃。

算法实现：

```js
/**
 * 2021-1-5
 * LRU (缓存淘汰算法):Least Recently Used 的缩写，
 * 这种算法认为最近使用的数据是热门数据，下一次很大概率将会再次被使用。
 * 而最近很少被使用的数据，很大概率下一次不再用到。当缓存容量的满时候，优先淘汰最近很少使用的数据。
 *
 * LRU 算法具体步骤
 * - 新数据直接插入到列表头部
 * - 缓存数据被命中，将数据移动到列表头部
 * - 缓存已满的时候，移除列表尾部数据。
 *
 * 以正整数作为容量 capacity 初始化 LRU 缓存
 * @param {*} capacity
 *
 */
function ListNode (key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.count = 0;
        this.dummy = new ListNode(null, null);
        this.tail = this.dummy;
        this.map = new Map();
    }

    removeHead () {
        this.map.delete(this.dummy.next.key);
        this.dummy.next = this.dummy.next.next;
        if (this.dummy.next !== null) {
            this.dummy.next.prev = this.dummy;
        }
    }
    appendTail (node) {
        this.tail.next = node;
        node.prev = this.tail;
        this.tail = node;
    }
    /**
     * 关键字 key 存在于缓存中，存在返回关键字的值，否则返回 -1
     * @param {*} key
     */
    get (key) {
        if (!this.map.has(key)) {
            return -1;
        }
        let node = this.map.get(key);
        if (node !== this.tail) {
            let prev = node.prev;
            prev.next = node.next;
            prev.next.prev = prev;
            this.appendTail(node);
        }
        return node.value;
    }
    /**
     * 如果关键字已经存在，则变更其数据值；
     *  如果关键字不存在，则插入该组「关键字-值」。
     * 当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间。
     * @param {*} key
     * @param {*} value
     */
    put (key, value) {
        let n = new ListNode(key, value);
        if (this.map.has(key)) {
            let node = this.map.get(key);
            if (node !== this.tail) {
                let prev = node.prev;
                prev.next = node.next;
                prev.next.prev = prev;
            } else {
                this.tail = this.tail.prev;
            }
        } else {
            if (this.count < this.capacity) {
                this.count++;
            } else {
                this.removeHead();
            }
        }
        this.appendTail(n);
        this.map.set(key, n);
    }
}
```


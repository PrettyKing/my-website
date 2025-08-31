## 1. API+源码高频考题

### 如何理解Vue 3的响应式系统？Vue3使用基于Proxy更快了？

#### 答案：

**使用基于Proxy初始化时懒处理，用户访问才做拦截处理，初始化更快一些，不是运行的时候更快了。**

Vue 3 的响应式系统是其最核心的部分之一，它基于 ES6 的 Proxy 对象进行了全新的实现，与 Vue 2 基于 Object.defineProperty 的实现相比，不仅更高效还更强大。

#### 主要概念：

1. **Reactive 对象**: 使用 `reactive` 函数可以将普通的 JavaScript 对象转换为响应式对象。

2. **Ref**: 使用 `ref` 函数可以创建一个包含响应式值的单一引用。

3. **Computed**: `computed` 函数用于创建依赖其他响应式对象或值的计算属性。

4. **Watch 和 WatchEffect**: 允许你观察响应式数据的变化，并执行相应的操作。

#### 工作原理：

1. **依赖追踪**: 当你访问响应式对象的某个属性时，Vue 会自动"记住"这个访问，并将当前的"效果"（effect，通常是一个组件的渲染函数或一个 watcher）添加到这个属性的依赖列表中。

2. **响应式更新**: 当你修改响应式对象的某个属性时，Vue 会找到依赖这个属性的所有效果，并将它们标记为"脏"（stale）以便重新执行或渲染。

3. **批量更新**: Vue 3 的响应式系统会聪明地批量更新效果，以避免不必要的重复执行。这一切都是自动、高效地完成的。

4. **嵌套属性**: 由于使用了 Proxy，Vue 3 能够自动地使对象的嵌套属性也变成响应式的。

5. **数组支持**: Vue 3 的响应式系统同样支持数组，并能捕捉到数组的变异操作。

6. **懒求值**: `computed` 属性具有懒求值（lazy-evaluation）的特性，只有当其依赖的数据发生变化时，才会重新求值。

#### 示例：

```javascript
import { reactive, ref, computed, watch } from "vue";

// 创建响应式对象
const state = reactive({ count: 0 });

// 创建 ref
const countRef = ref(0);

// 创建计算属性
const double = computed(() => state.count * 2);

// 创建 watcher
watch(
  () => state.count,
  (newVal, oldVal) => {
    console.log(`count changed: ${oldVal} -> ${newVal}`);
  }
);

// 修改状态，触发响应
state.count++;
countRef.value++;
```

#### 性能优化：

1. **Shallow Reactive 和 Shallow Ref**: 可以用于创建"浅"响应式对象，即不会深入到嵌套属性。

2. **Readonly**: 可以用于创建只读的响应式对象。

3. **Batching**: 通过异步队列和 `nextTick`，Vue 3 能更智能地批量处理响应式更新，减少 DOM 操作和计算。

4. **Suspense 和异步组件**: 与响应式系统结合，能有效地管理异步操作和状态。

Vue 3 的响应式系统不仅是其自身 MVVM 框架的基础，还可以作为一个独立的响应式状态管理库用于其他场景和框架。这也是为什么 Vue 3 的 Composition API 受到了广泛的关注，因为它允许你更灵活、更组合化地管理响应式状态。

### 什么是Suspense组件，它是如何实现的？

#### 答案：

Vue 3 中的 `Suspense` 组件是用于处理异步依赖的一种机制。当你有异步组件或者在 `setup` 函数中有异步操作并希望在这些异步依赖加载完成前显示一个"fallback"内容（如加载指示器），你可以使用 `Suspense`。

#### 工作原理：

1. **捕捉异步组件**: `Suspense` 可以捕捉其作用域内的异步组件。当这些组件还未解析完成（通常是网络加载）时，`Suspense` 会渲染它的 `fallback` 插槽内容。

2. **与 async setup() 配合**: 在组件的 `setup` 函数中，你也可以返回一个 Promise。如果你这样做了，`Suspense` 也会等待这个 Promise 解析完成才渲染实际内容。

3. **多层嵌套**: `Suspense` 组件可以嵌套使用，这样内层的 `Suspense` 可以被外层的 `Suspense` "捕获"。

4. **Reactivity**: 由于 `Suspense` 是与 Vue 的响应式系统集成的，所以一旦异步依赖完成，`Suspense` 会自动重新渲染，替换 `fallback` 为实际内容。

5. **插槽**: `Suspense` 使用了两个插槽 —— `default` 和 `fallback`。`default` 插槽用于你希望渲染的实际内容，`fallback` 插槽用于在等待异步依赖期间展示的内容。

#### 用法示例：

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue'))

export default {
  components: {
    AsyncComponent
  }
}
</script>
```

在这个例子中，`AsyncComponent` 是一个异步组件。只有当这个组件完全加载和初始化后，`Suspense` 才会从展示 "Loading..." 切换到展示这个组件。

总的来说，`Suspense` 组件提供了一种优雅和集成的方式来处理异步依赖，使得用户界面在等待这些依赖时仍然响应和友好。

### 在Vue 3中，ref 和 reactive 有何区别？

#### 答案：

在 Vue 3 中，`ref` 和 `reactive` 都是用于创建响应式数据的，但它们有一些关键区别和使用场景。

#### ref

1. **单一值**: `ref` 用于创建一个响应式引用，通常用于基本类型（如 `String`、`Number`、`Boolean`）。

2. **访问值**: 当你需要访问 `ref` 创建的响应式变量时，需要使用 `.value` 属性。

```javascript
const count = ref(0);
console.log(count.value); // 0
```

3. **模板中的简化**: 在模板中，你不需要使用 `.value`，Vue 会自动解引用。

```vue
<template>
  <div>{{ count }}</div> <!-- 自动解引用 -->
</template>
```

4. **可重新赋值**: 你可以通过 `count.value = 1` 赋予一个新值。

5. **转换对象**: 使用 `ref` 创建的响应式对象，在解构或传递到其他函数时，会失去其响应性。需要使用 `toRefs` 或 `toRef` 来保持响应性。

#### reactive

1. **对象/数组**: `reactive` 用于创建响应式对象或数组。

2. **访问值**: 访问 `reactive` 创建的响应式对象就像访问普通对象一样。

```javascript
const state = reactive({ count: 0 });
console.log(state.count); // 0
```

3. **不可重新赋值**: 对 `reactive` 创建的响应式对象的根重新赋值（例如 `state = { ... }`）不会改变响应性。但其内部属性可以被修改。

4. **嵌套响应性**: 当你创建一个响应式对象，其内部嵌套的所有对象和数组也会自动变为响应式。

5. **解构问题**: 如果你解构一个使用 `reactive` 创建的响应式对象，解构出来的值将失去响应性。这与 `ref` 是相似的，但你可以使用 `toRefs` 或 `toRef` 函数来解决这个问题。

#### 对比

- `ref` 更适用于单一的、独立的值，或者当你需要在模板中直接使用时。
- `reactive` 更适用于复杂的、嵌套的对象或数组。

你可以使用 `toRef` 和 `toRefs` 辅助函数在 `ref` 和 `reactive` 之间转换，以适应不同的使用场景。

选择 `ref` 还是 `reactive` 取决于具体的需求和你的个人喜好。一些开发者更倾向于使用 `ref` 来管理所有状态（包括对象和数组），因为这样可以保持代码的一致性；而另一些开发者更喜欢根据用例选择 `ref` 或 `reactive`。

### Vue 3 如何实现组件的懒加载？

#### 答案：

使用 `defineAsyncComponent` 方法，它会返回一个异步组件。

#### setup 函数在组件生命周期的哪个阶段执行？

#### 答案：

在 Vue 3 中，`setup` 函数是在组件实例化时，在生命周期钩子 `beforeCreate` 和 `created` 之间执行的。这意味着在 `setup` 函数执行时，组件实例已经被创建，但还没有进行初始化（例如，还没有进行数据观测、没有设置代理、还没有设置生命周期钩子等）。

以下是组件初始化和 `setup` 函数执行的大致顺序：

1. 组件实例被创建。
2. `beforeCreate` 生命周期钩子被调用（如果定义了的话）。
3. `setup` 函数执行。在这个阶段，你可以进行响应式数据的定义、计算属性、侦听器等逻辑的设置。
4. `created` 生命周期钩子被调用。
5. 模板编译和挂载到 DOM。
6. 其他生命周期钩子（如 `beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeUnmount`、`unmounted` 等）。

因此，`setup` 函数为你提供了一个在组件完全初始化之前设置组件逻辑的机会。这样做有几个好处：

- **代码组织**：你可以在一个统一的地方设置组件的所有响应式逻辑，使得代码更易于管理和维护。

- **优化**：由于 `setup` 执行的时机较早，Vue 可以更有效地进行代码的静态分析，这有助于进行更多的优化。

- **灵活性**：`setup` 函数允许你使用 `ref` 和 `reactive` 等 Composition API，这比使用 `data`、`methods`、`computed` 和 `watch` 等选项 API 提供了更高的灵活性和组合性。

### Vue 3 中的 emit 是如何实现的？

#### 答案：

在 Vue 3 中，`emit` 方法用于子组件向父组件发送自定义事件。这是 Vue 组件间通信的一种常用方式。在 Composition API 的 `setup` 函数中，`emit` 可以作为第二个参数提供。

下面是一个简单的例子，展示如何在一个按钮点击事件中使用 `emit`：

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

// 第二个参数 emit
export default ({}, { emit }) => {
  // 定义一个方法，用于增加 count 并触发一个名为 'increment' 的自定义事件
  const increment = () => {
    count.value++
    emit('increment', count.value)
  }

  return {
    count,
    increment
  }
}
</script>

<template>
  <button @click="increment">Click Me: {{ count }}</button>
</template>
```

在父组件中，你可以这样监听这个自定义事件：

```vue
<template>
  <ChildComponent @increment="handleIncrement" />
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  methods: {
    handleIncrement(count) {
      console.log(`Count is incremented to: ${count}`)
    }
  }
}
</script>
```

#### 实现原理

从内部实现的角度看，`emit` 实际上是一个函数，它接收事件名称和可选的数据作为参数。当 `emit` 被调用时，Vue 会在组件实例的内部事件列表中查找对应的事件名称，然后逐一执行该事件的所有监听函数，同时将传入的数据作为参数传递给这些监听函数。

具体来说，Vue 内部会维护一个事件监听器的列表（通常是一个对象或 Map），键是事件名称，值是一个包含所有监听函数的数组。当 `emit` 被调用时，Vue 会查找这个列表，找到与事件名称匹配的所有监听函数，并按照它们被添加的顺序执行它们。

这个机制允许 Vue 组件具有很高的灵活性，因为你可以随时添加或删除事件监听器，也可以通过 `emit` 发送任何类型的数据。这也是 Vue 在组件间通信方面非常强大的一个原因。

### Vue 3 的编译器和运行时是如何分离的？

#### 答案：

在 Vue 3 中，编译器（Compiler）和运行时（Runtime）是明确分离的，这样做有多个好处，包括更小的运行时体积、更多的编译时优化等。

#### 编译器（Compiler）

编译器的任务是将 Vue 组件的模板转换为渲染函数（render functions）。这通常在构建阶段完成，例如，当你使用 Vue CLI、Webpack 或其他构建工具进行项目构建时。

在 Vue 3 中，编译器支持多种模式，包括：

- **基础模式**：用于转换简单的模板语法。
- **优化模式**：用于分析模板以识别静态节点和静态属性，从而进行优化。

编译器还可以通过各种插件和选项进行扩展，以支持如 JSX、Pug 等其他自定义语法。

#### 运行时（Runtime）

运行时是一个更小的、更轻量级的库，负责管理 Vue 组件的生命周期、响应式系统、虚拟 DOM 操作等。由于运行时不包括编译器，所以它有更小的文件体积，更适合前端性能优化。

运行时库提供了一组 API，允许你创建和管理 Vue 组件，处理组件的状态和生命周期事件，以及进行底层的 DOM 操作。

#### 分离的好处

1. **体积优化**：由于运行时不包含编译器，所以它的体积更小，这有助于减少前端资源的加载时间。

2. **灵活性**：分离的设计使得 Vue 更加灵活。例如，你可以只使用运行时库，而完全用 JSX 或手动创建渲染函数，以避免编译步骤。

3. **编译时优化**：由于编译步骤是独立的，Vue 编译器可以应用多种编译时优化技巧，如静态内容提升、模块分析等。

#### 使用场景

- **完整版（Runtime + Compiler）**：如果你在项目中直接使用了 `template` 字符串（例如，通过 `inline-template` 或手动挂载组件），则需要使用包含编译器的完整版。

- **运行时版（Runtime-only）**：如果你使用的所有组件模板都是在构建阶段预编译的（这是最常见的场景），则只需使用运行时版本。

#### 示例

在项目配置中，你可以通过别名的方式选择不同版本：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js' // 使用运行时版
    }
  }
};
```

通过这种方式，Vue 3 的编译器和运行时实现了高度的可定制性和优化，以适应不同的开发需求和性能要求。

### Vue 3 是如何处理异步更新队列的？

#### 答案：

Vue 3 使用了一个异步更新队列来批量处理数据变更和组件的重新渲染。当你更改组件状态（例如，改变一个响应式对象或 `ref` 的值）时，Vue 不会立即更新 DOM，而是将该组件标记为"脏"（即需要更新）并将其添加到一个队列中。这个队列在下一个事件循环的 "microtask" 阶段被刷新，以实际执行 DOM 更新。

这样做有几个好处：

1. **性能优化**：如果在同一个事件循环中多次修改状态，Vue 只需要进行一次实际的 DOM 更新，而不是多次。这显著减少了不必要的工作。

2. **一致性**：由于所有的状态更新都在同一个队列中，这意味着所有的更新都将按照它们被添加到队列的顺序来执行，确保数据的一致性。

#### 实现细节

Vue 3 使用 `Promise`、`MutationObserver` 或其他可用的异步 API 来异步地刷新队列。当一个组件的状态改变时：

1. Vue 会将组件实例添加到一个内部队列中（如果它还没有被添加）。

2. 如果这是队列中的第一个组件，Vue 会计划异步任务来刷新整个队列。

3. 在下一个事件循环的 "microtask" 阶段，Vue 会清空队列，执行实际的 DOM 更新。

这个过程也考虑了组件的依赖关系：父组件总是在其子组件之前更新。

#### 示例

假设你有一个计数器组件，它在一次用户交互中多次改变状态：

```javascript
const { ref } = require("vue");

const counter = ref(0);

function incrementCounter() {
  counter.value++;
  counter.value++;
  counter.value++;
}

incrementCounter();
```

即使 `incrementCounter` 函数更改了 `counter` 三次，Vue 会合并这些更改，并只执行一次实际的 DOM 更新。

这样，Vue 通过异步更新队列，有效地批处理了多个状态更改，优化了性能，并确保了应用状态的一致性。

### Vue 3 的模板是如何编译的？

#### 答案：

Vue 3 的模板编译涉及几个主要的步骤，最终目的是将模板转换成一个渲染函数，这个渲染函数用于生成 Virtual DOM。以下是这个过程的主要步骤：

#### 解析（Parsing）

首先，编译器需要解析 HTML 模板字符串，将其转换成一个抽象语法树（AST，Abstract Syntax Tree）。在这个阶段，编译器会解析标签、属性、文本内容等，并将这些信息存储在 AST 节点中。

例如，模板 `<div>{{ message }}</div>` 可能会被解析成一个类似于以下结构的 AST：

```json
{
  "tag": "div",
  "children": [
    {
      "type": "interpolation",
      "expression": "message"
    }
  ]
}
```

#### 优化（Optimization）

在解析之后，编译器会进行优化步骤。这通常涉及标记 AST 中的静态节点（不会改变的节点）和静态根（一个永远不会改变的子树）。这样做可以在后续的 diff 算法中跳过这些节点，从而提高渲染性能。

#### 代码生成（Code Generation）

优化后的 AST 需要被转换成 JavaScript 代码，这是通过代码生成步骤完成的。在这个阶段，编译器会遍历优化后的 AST，并生成相应的渲染函数代码。

通常，这个渲染函数使用 Vue 的 `h` 函数（或 `createElement` 函数）来创建 Virtual DOM。例如，前面提到的 `<div>{{ message }}</div>` 的 AST 可能会被转换成以下渲染函数：

```javascript
function render() {
  return h('div', null, this.message);
}
```

这个渲染函数最终会被附加到 Vue 组件的实例上，用于生成和更新实际的 DOM。

#### 额外的编译特性

Vue 3 的编译器还支持多种高级特性，包括：

- **指令（Directives）**：内置或自定义的指令（如 `v-if`、`v-for`、`v-bind` 等）在编译阶段会被特殊处理，转换成相应的渲染函数逻辑。

- **动态组件和异步组件**：使用 `is` 属性或 `defineAsyncComponent` 方法定义的动态或异步组件也会在编译阶段得到特殊处理。

- **JSX 和其他模板语法**：Vue 3 的编译器可以通过插件和选项进行扩展，以支持 JSX 或其他自定义模板语法。

通过这些步骤，Vue 3 的编译器能够将模板转换成高效的渲染函数，这些渲染函数在运行时负责生成和更新 DOM。这也是 Vue 能提供高性能、灵活性和易用性的关键因素之一。

### Vue 3 的 watch 和 watchEffect 有何区别？

#### 答案：

`watch` 需要明确指定依赖，而 `watchEffect` 会自动收集依赖。

### Vue 3 的响应式系统和 React Hooks 相比有何优势？

#### 答案：

Vue 3 的响应式系统和 React Hooks 都是用于构建现代 Web 应用程序的强大工具，但它们在设计哲学、实现细节和使用场景上有一些不同。下面列出了一些 Vue 3 响应式系统相对于 React Hooks 的优势：

#### 易用性和学习曲线：

1. **直观性**: Vue 的响应式系统通常更直观，特别是对于不熟悉函数式编程概念的开发者来说。

2. **语法糖**: Vue 提供了更多的语法糖（例如，`v-model`、`v-for` 等），这使得模板代码更易读和理解。

#### 粒度和优化：

1. **细粒度响应式**: Vue 3 使用 Proxy 机制来跟踪每个属性的依赖关系，这使得系统能够精确地知道哪些组件需要重新渲染，这可能导致更高的性能。

2. **优化重新渲染**: 由于更精细的依赖跟踪，Vue 通常只会更新实际更改的部分，而 React 可能需要使用额外的优化（例如，`React.memo`、`useMemo` 和 `useCallback`）来达到相同的效果。

#### 数据处理：

1. **响应式对象**: 在 Vue 中，整个对象或数组可以是响应式的，这使得复杂状态管理更容易实现。

2. **内置深度响应式**: Vue 内置支持深度响应式，而在 React 中，你通常需要使用额外的库或手动处理。

#### 构建和工具链：

1. **模板 vs JSX**: Vue 的模板语法可以通过编译时优化来提高性能，而 JSX 则更依赖运行时。

2. **单文件组件**: Vue 的单文件组件将模板、脚本和样式组合在一个文件中，这对于组件的封装和管理有好处。

#### 状态管理：

1. **Vue 的响应式系统 + Vuex**: Vuex 与 Vue 的响应式系统紧密集成，提供了一种更一致和全面的状态管理解决方案。

2. **计算属性**: Vue 的计算属性（`computed`）是响应式依赖的一种强大方式，它自动跟踪依赖并只在需要时重新计算。

这并不是说 Vue 一定比 React 更好，事实上，React Hooks 也有它自己的一系列优势和适用场景。选择哪一个取决于你的具体需求、团队经验以及项目类型。

### Vue 3 是如何实现条件渲染的？

#### 答案：

#### 1. 模板解析

在 Vue 3 中，当你使用诸如 `v-if`、`v-else-if`、和 `v-else` 的指令时，首先这些会在编译阶段被解析为一个抽象语法树（AST）。

#### 2. 代码生成

编译器接下来会遍历 AST，并生成对应的渲染函数。在这个阶段，`v-if` 和相关指令会被转换为条件语句。

例如，以下模板：

```vue
<div>
  <p v-if="show">This is visible</p>
  <p v-else>This is not visible</p>
</div>
```

可能会被编译为类似下面的渲染函数：

```javascript
import { h } from 'vue';

export function render() {
  return h('div', [
    this.show ? h('p', 'This is visible') : h('p', 'This is not visible')
  ]);
}
```

#### 3. 运行时

在运行时，渲染函数会被调用，并根据当前的响应式数据（在这个例子中是 `show` 属性）来决定渲染哪个元素。

#### 4. Virtual DOM 和真实 DOM

生成的 Virtual DOM 会与前一个 Virtual DOM 树进行对比（diffing）。仅变化的部分会更新到真实的 DOM 中。

#### 5. 响应式依赖跟踪

因为 `v-if` 表达式的值依赖于响应式数据（在这个例子中是 `show`），所以当 `show` 改变时，Vue 知道需要重新执行渲染函数，然后更新 DOM。

这样，Vue 3 通过编译时优化和运行时的响应式系统，有效地实现了条件渲染。这不仅使得条件渲染非常高效，还允许在模板中用非常直观和易读的语法来表达复杂的 UI 逻辑。

### Vue 3 中的 computed 是如何实现的？

#### 答案：

在 Vue 3 中，`computed` 函数通过依赖跟踪和缓存机制实现。当你访问一个计算属性时，Vue 会执行与该计算属性相关联的函数，并同时记录所有被访问的响应式依赖（例如，其他响应式变量或其他计算属性）。

当这些依赖中的任何一个发生变化时，Vue 会知道需要重新计算这个计算属性。但是，如果依赖没有变化，Vue 会直接返回上一次计算的结果，而不会重新执行计算函数，从而实现缓存和性能优化。

**`computed` 使用缓存机制，只在依赖改变时重新计算。**

这一切都是通过 Vue 3 的响应式系统和 Proxy API 实现的，使得计算属性非常高效。

### 如何理解 Vue 3 中的 SSR（服务器端渲染）？

#### 答案：

Vue 3 提供了对 SSR 的一流支持，包括异步组件、数据预取等。

### Vue 3 的 nextTick 是如何实现的？

#### 答案：

Vue 3 中的 `nextTick` 函数用于延迟执行一段代码，直到下一次 DOM 更新循环结束。这通常用于等待 Vue 完成依赖数据的更新和组件的重新渲染。

`nextTick` 的实现原理依赖于 JavaScript 的微任务（microtask）队列或宏任务（macrotask）队列。在浏览器环境下，Vue 3 尝试使用 `Promise.then()`、`MutationObserver` 或 `setImmediate` 这样的异步 API 来实现 `nextTick`。

简单来说，当你调用 `nextTick` 函数，Vue 会将传递给它的回调函数放入一个任务队列中。这个任务队列会在当前的事件循环结束和下一个事件循环开始之间执行，确保回调函数执行时 DOM 已经更新。

这样，通过 `nextTick`，你可以确保在操作或查询 DOM 之前，视图已经完成了更新，从而避免了不一致和潜在的错误。

### Vue 3 中的 shallowReactive 和 shallowRef 有何用途？

#### 答案：

**用于创建浅响应式对象，只追踪第一层属性的变化。**

#### shallowReactive 和 shallowRef 的用途

`shallowReactive` 和 `shallowRef` 是 Vue 3 中用于创建浅响应式对象的 API。与 `reactive` 和 `ref` 不同，它们不会将嵌套的对象或数组转换为响应式。

1. **shallowReactive**: 当你使用 `shallowReactive` 包装一个对象后，这个对象的第一层属性会变成响应式的，但任何嵌套的对象或数组都不会变成响应式。这在你不希望 Vue 跟踪嵌套属性变化时非常有用。

```javascript
const shallow = shallowReactive({ a: { b: 1 } });
shallow.a.b = 2; // 这里不会触发视图的更新
```

2. **shallowRef**: 类似于 `shallowReactive`，但用于单个值。`shallowRef` 创建的 ref 对象在 `.value` 属性被访问时不会自动解包（unwrapping），并且它持有的嵌套对象不会被转换为响应式。

```javascript
const sRef = shallowRef({ a: 1 });
sRef.value.a = 2; // 这里不会触发视图的更新
```

这两个 API 在以下几种情况下特别有用：

- 当你处理非常大的对象或数组，且不需要跟踪它们所有嵌套属性的变化时，以减少性能开销。
- 当你希望避免对象内部状态被 Vue 管理，例如第三方库的实例对象。

这样，通过使用 `shallowReactive` 和 `shallowRef`，你可以更灵活地控制响应式系统的行为，优化性能或与非响应式的代码进行交互。

### Vue 3 中的 Transition 组件是如何工作的？

#### 答案：

#### Transition 组件的工作原理

Vue 3 的 `Transition` 组件用于在元素或组件的进入/离开过渡中自动应用类名，从而可以使用 CSS 或 JavaScript 钩子函数来定义过渡效果。

以下是 `Transition` 组件如何工作的基本步骤：

1. **监听条件**: `Transition` 组件通常与条件渲染（如 `v-if`、`v-show`）或动态组件一起使用，以便知道何时触发过渡。

2. **阶段类名**: 在不同阶段（如进入或离开）的过渡中，`Transition` 组件会自动附加或删除类名。默认情况下，这些类名是 `v-enter-active`、`v-enter-from`、`v-enter-to` 等。

3. **CSS 过渡**: 通过配合上述自动应用的类名，你可以在 CSS 中定义相应的过渡或动画效果。

```css
.v-enter-active, .v-leave-active {
  transition: opacity 1s;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}
```

4. **JavaScript 钩子**: 如果你需要更复杂的过渡效果或逻辑，还可以使用如 `@before-enter`、`@enter`、`@after-enter` 等钩子。

5. **执行过渡**: 当触发条件改变（如从 `v-if="false"` 切换到 `v-if="true"`），`Transition` 组件会按照预定义的规则和钩子来执行相应的过渡效果。

6. **移除或插入 DOM**: 在过渡完成后，`Transition` 组件会自动处理 DOM 元素的插入或移除。

这样，`Transition` 组件使得实现复杂的过渡和动画效果变得相对简单，同时也允许高度的自定义和灵活性。

### v-model 的双向数据绑定实现

#### 答案：

Vue 3 中的 `v-model` 指令用于实现双向数据绑定，主要用在表单元素和自定义组件中。它是语法糖，背后实际上是一个组合了属性绑定和事件监听的机制。以下是其工作原理：

1. **属性绑定**: `v-model` 在内部会将变量绑定到元素或组件的某个属性上。对于原生 HTML 元素（如 `input`），通常会绑定到 `value` 属性。

```html
<!-- 相当于 -->
<input :value="someVar" />
```

2. **事件监听**: 同时，`v-model` 也会自动添加一个事件监听器，用于捕获用户输入或改变。对于 `input` 元素，这通常是 `input` 事件。

```html
<!-- 相当于 -->
<input @input="someVar = $event.target.value" />
```

3. **组合**: 结合上述两个步骤，`v-model="someVar"` 实际上是以下两个操作的缩写：

```html
<input :value="someVar" @input="someVar = $event.target.value" />
```

4. **自定义组件**: 在自定义组件中，`v-model` 的行为也是类似的。默认情况下，它会绑定到组件的 `modelValue` 属性，并监听组件的 `update:modelValue` 事件。但你也可以自定义 prop 名称和事件。

5. **响应式更新**: 由于 Vue 的响应式系统，当数据变量（在这里是 `someVar`）改变时，所有与之绑定的 UI 元素也会自动更新。反之，当 UI 元素触发绑定的事件（如 `input`）时，数据变量也会被更新。

通过这种方式，`v-model` 实现了数据和视图之间的双向绑定，使得开发者能以更直观和简洁的方式管理 UI 状态。

### Vue 3 父组件和子组件如何通信？

#### 答案：

在 Vue 3 中，父组件与子组件之间主要通过以下几种方式进行通信：

1. **Props Down**: 父组件通过 props 向子组件传递数据。

```html
<!-- 父组件 -->
<ChildComponent :someProp="parentData" />
```

```javascript
// 子组件
props: ['someProp']
```

2. **Events Up**: 子组件通过自定义事件向父组件发送消息。

```html
<!-- 父组件 -->
<ChildComponent @customEvent="handleEvent" />
```

```javascript
// 子组件
this.$emit('customEvent', eventData);
```

3. **Scoped Slots**: 父组件可以通过作用域插槽访问子组件暴露出的属性或方法。

```html
<!-- 父组件 -->
<ChildComponent>
  <template #default="slotProps">
    {{ slotProps.someValue }}
  </template>
</ChildComponent>
```

4. **Refs**: 父组件可以使用 `ref` 直接访问子组件的实例。

```html
<!-- 父组件 -->
<ChildComponent ref="childRef" />
```

```javascript
// 父组件
this.$refs.childRef.someMethod();
```

5. **Provide / Inject**: 虽然这不是直接的父子通信方式，但 `provide` 和 `inject` 可以用于跨多级父子组件进行数据或方法的传递。

6. **Composition API**: 使用 `setup` 函数和 Composition API，父组件和子组件可以通过 `reactive`、`ref`、`watch` 等更灵活的方式进行数据共享和通信。

7. **Vuex**: 对于更复杂的状态管理，通常使用 Vuex。虽然这不是直接的父子通信，但它提供了一个集中式存储来管理多个组件之间的状态。

8. **Bus / EventEmitter**: 在某些情况下，你也可以创建一个全局的事件总线来进行非父子组件之间的通信。

通过组合这些通信机制，你可以构建出高度解耦、可维护和可测试的 Vue 应用程序。

### 如何理解 Vue 3 中的 provide 和 inject？如何实现的？

#### 答案：

#### 理解 provide 和 inject

`provide` 和 `inject` 是 Vue 3 中用于依赖注入的 API，主要用于实现父组件与后代组件（不仅仅是直接的子组件）之间的通信。这种机制让你能跨越多层嵌套组件传递数据或函数，而不必一层一层地手动传递 props。

1. **provide**: 在一个组件中，你可以使用 `provide` 选项（或 `provide` 函数）来声明该组件要提供哪些数据或方法给后代组件。

```javascript
// 在父组件中
provide: {
  someData: 'data provided',
  someMethod: () => { /* ... */ }
}
```

2. **inject**: 在任何后代组件中，你可以使用 `inject` 选项（或 `inject` 函数）来声明该组件需要注入哪些数据或方法。

```javascript
// 在后代组件中
inject: ['someData', 'someMethod']
```

#### 如何实现的

1. **响应式存储**: 当一个组件调用 `provide` 时，Vue 会在内部将提供的数据和方法存储在一个响应式的依赖注入对象中。

2. **查找逻辑**: 当一个组件调用 `inject` 时，Vue 会从该组件开始，向上遍历组件树，直到找到一个组件，该组件提供了相应的依赖。

3. **建立响应式连接**: 如果提供的数据是响应式的，通过 `inject` 获取的数据也将是响应式的。这意味着，如果 `provide` 提供的数据发生变化，所有注入了该数据的组件都会自动更新。

4. **Symbol**: 为了避免命名冲突，你也可以使用 ES6 的 Symbol 作为 `provide` 和 `inject` 的键。

这种机制有助于实现更加解耦和可复用的组件，但也需要谨慎使用，以避免导致组件之间的过度耦合或使得数据流难以追踪。

### Vue 3 中，什么是 Custom Renderer API？

#### 答案：

#### 什么是 Custom Renderer API？

在 Vue 3 中，Custom Renderer API 是一个高级特性，允许你创建自定义的渲染器以实现更灵活、定制化的渲染逻辑。这是 Vue 3 架构改进的一部分，使其核心渲染逻辑更加模块化和可扩展。

与 Vue 2 的服务端渲染(SSR)和默认的 DOM-based 渲染不同，Custom Renderer API 允许你决定如何将虚拟 DOM（VNode）转换为实际的 UI 输出。这为渲染到非-DOM 环境（如 Canvas、WebGL 或甚至原生移动应用界面）提供了可能。

#### 如何工作？

Custom Renderer 通常由一组与特定渲染目标（如 DOM、Canvas 等）相关的方法组成。这些方法描述了如何创建、更新或删除实际的 UI 元素。

例如，如果你正在创建一个 Canvas 渲染器，你可能需要定义如下方法：

- `createInstance`: 创建一个新的 Canvas 元素。
- `appendChild`: 在 Canvas 中添加一个子元素。
- `removeChild`: 从 Canvas 中删除一个子元素。
- `insertBefore`: 在 Canvas 中的两个子元素之间插入一个新的子元素。
- 等等。

然后，你可以使用 `createRenderer` 方法从这些钩子函数创建一个新的渲染器：

```javascript
import { createRenderer } from 'vue';

const { createApp } = createRenderer({
  /* your methods here */
});

const app = createApp(YourRootComponent);
// 使用该渲染器将应用挂载到特定的"容器"中
```

通过这种方式，Custom Renderer API 为 Vue 提供了巨大的灵活性和扩展性，使其不仅限于浏览器环境，也可以用于各种其他渲染目标。这对于游戏开发、图形库或者跨平台应用（如使用 NativeScript 或 Weex）尤为有用。

### Vue3.0 所采用的 Composition Api 与 Vue2.x 使用的 Options Api 有什么不同？

#### 答案：

#### Vue3.0 的 Composition API 与 Vue2.x 的 Options API 的不同之处

1. **组织代码的方式**：
   - **Composition API**: 使用 `setup` 函数集中管理组件的状态和逻辑，使得代码更易于阅读和维护。
   - **Options API**: 在不同的选项（如 `data`、`methods`、`computed`、`watch`）中分散组件状态和逻辑。

2. **逻辑复用和组合**：
   - **Composition API**: 更容易地抽取和复用组件逻辑，无需使用 mixin 或其他抽象机制。
   - **Options API**: 通常需要使用 mixin 或高阶组件等方式来复用逻辑，这可能导致命名冲突和组件之间紧密耦合。

3. **类型支持**：
   - **Composition API**: 由于是基于函数，更容易与 TypeScript 集成。
   - **Options API**: 可能需要额外的类型声明和装饰器。

4. **响应式声明**：
   - **Composition API**: 使用 `ref` 和 `reactive` 显式地创建响应式状态。
   - **Options API**: 响应式状态通常在 `data` 选项内隐式创建。

5. **生命周期钩子**：
   - **Composition API**: 在 `setup` 函数中，生命周期钩子如 `onMounted`、`onUpdated` 等以函数的形式存在。
   - **Options API**: 生命周期钩子以组件选项的形式存在，如 `mounted`、`updated` 等。

6. **模板使用**：
   - **Composition API**: 模板中可以直接使用 `setup` 函数返回的所有变量和方法。
   - **Options API**: 模板中的数据和方法需要分别在 `data`、`computed`、`methods` 等选项中定义。

7. **依赖追踪**：
   - **Composition API**: 更细粒度的依赖追踪，只有实际使用的状态会触发组件更新。
   - **Options API**: 在某些场景下可能导致不必要的组件重新渲染。

8. **代码分割和按需引入**：
   - **Composition API**: 容易进行代码分割和按需引入，因为相关的逻辑可以更容易地组织在一起。
   - **Options API**: 代码分割和按需引入通常更复杂和冗余。

9. **可读性和维护性**：
   - **Composition API**: 对于复杂组件，由于逻辑是更集中的，因此通常更容易理解和维护。
   - **Options API**: 对于简单组件，由于 API 是分散的，所以可能更直观。

10. **社区和生态系统**：
    - **Composition API**: 是 Vue 3 的新特性，可能需要时间来构建周围的生态系统。
    - **Options API**: 已经有成熟的社区和丰富的资源。

两者有各自的优点和缺点，而 Vue 3 也支持两者的混合使用，使得开发者可以根据具体需求选择最适合的 API。

### Vue3.0性能提升主要是通过哪几方面体现的？

#### 答案：

#### 1. 响应式系统升级：

Vue 3 使用 Proxy-based 的响应式系统，相比 Vue 2 的 `Object.defineProperty` 提供了更高的性能和更多的特性。

#### 2. 编译优化：

- **静态树提升**：编译时会识别出不需要动态改变的 DOM，这部分 DOM 会被提升出去，减少了重渲染的成本。
- **静态属性提升**：和静态树类似，静态的属性也会被提升。
- 模板中的动态节点只会比对它们自己的"范围"，而不是整个组件。

#### 3. 更小的体积：

Vue 3 的源码是按功能模块化的，所以通过 tree-shaking 可以更有效地减小最终应用的体积。

#### 4. Fragment 和 Portal：

- **Fragment** 允许你没有根元素的组件，这让 DOM 结构更加灵活。
- **Portal** 提供了一种将子组件渲染到 DOM 树的其他位置的方法，提供了更高效的 DOM 更新策略。

#### 5. 更快的挂载和更新：

新的 Diff 算法（Longest Stable Subsequence）优化了列表渲染的性能。

#### 6. 自定义渲染器 API：

Vue 3 提供了更多底层的 API，允许开发者创建自定义渲染器，从而优化特定场景下的性能。

#### 7. Composition API：

提供了更灵活的逻辑复用和组合方式，而不需要通过 mixins 或者高阶组件，这样可以减少组件之间不必要的依赖和冲突，从而提高性能。

#### 8. 更高效的事件处理：

事件侦听器在内部被更高效地管理，尤其是在大型应用中。

#### 9. 异步组件和代码分割：

Vue 3 提供了更简洁的异步组件和代码分割的支持，使得按需加载更加容易，从而提高了应用的加载性能。

#### 10. 更多生命周期钩子和工具方法：

新增的生命周期钩子和工具方法（如 `nextTick`）为性能优化提供了更多可能。

通过这些方面的优化和改进，Vue 3 在性能和效率上都有很大提升，使得开发者能构建更快速、更灵活的前端应用。

### 详细阐述一下 Vue3 dom diff原理？

#### 答案：

1. **普通的diff** ➽ 遍历旧数据去挨个去新数据中查找，哪些被删除了，哪些被移动了然后在遍历新数据，去旧数据中查找哪些数据是新增的https://react.docschina.org/docs/reconciliation.html（packages/react-reconciler/src/ReactFiberCompleteWork.new.js）通过updatePayload定位到diff

2. **Vue3的原理** ✐ C1:["a","b","c","d","g","f"] ✎ C2:["a","e","b","d","c","f"]

   2-1. 从前往后比较，相同节点 ["a"] 进行 patch，遇到不相同的节点停止比较
   
   2-2. 从后往前比较，相同节点 ["f"] 进行 patch，遇到不相同的节点停止比较
   
   2-3. 如果 c1 中的所有节点都已经比较完了，c2 中剩余没有比较的节点都是新数据，执行 mount
   
   2-4. 如果 c2 中的所有节点都已经比较完了，c1 中剩余没有比较的节点都是需要删除的，执行 unmount
   
   2-5. 如果 c1 和 c2 中都有剩余节点，对剩余节点进行比较
   
   a). 找出需要删除的节点，执行 unmount
   
   b). 找出新、旧节点的对应关系，利用 "最长递增子序列" 优化节点的移动、新增。这一步是 diff 算法的核心
   
   2-6. 新元素没有比较完成的 keyToNewIndexMap[d:2,f:3,c:4,e:5,x:6,y:7]
   
   2-7. 根据未比较完的数据长度，建一个填充 0 的数组 [0,0,0,0,0]
   
   2-8. 老元素没有比较完成的 newIndexToOldIndexMap[4(d),6(f),3(c),5(e),0,0]
   
   2-9. 尾到头循环一下newIndexToOldIndexMap 是 0 的，说明是新增的数据，就mount 进去非 0 的
   
   2-10. 把 c 移动到 e 之前、把 f 移动到 c 之前、把 d 移动到 f 之前
   
   2-11. 上面很啰嗦 newIndexToOldIndexMap找到最长递增子序列•我们的 [4(d),6(f),3(c),5(e),0,0] 很明显能找到 [3,5] 是数组中的最长递增子序列• 于是乎 [3,5] 都不需要移动
   
   2-12. 最长递增子序列 ✄ patchKeyedChildren

```javascript
// c1 旧数据
["a","b","c","d","e","f","g"]

// c2 新数据
["a","c","d","b","f","i","g"]
```

要将 ["b", "c" ,"d"] 变成 ["c", "d", "b"]，c , d 不用动，只需要将 b 移动到 d 之后就可以了，不需要将 c 和 d 分别移动到 b 之前。

#### Vue 3 的 DOM Diff 流程

在 Vue 3 中，DOM Diff 算法（也称为 "Reconciliation" 算法）主要负责找出两个虚拟 DOM 树之间的差异，并将这些差异最小化地应用到真实的 DOM 上。以下是这一流程的详细阐述：

1. **触发更新**: 当组件的状态（`data`、`props`、等等）发生改变时，Vue 会触发一个重新渲染。

2. **生成新的 Virtual DOM 树**: Vue 会基于新的组件状态生成一个新的 Virtual DOM 树。

3. **比较新旧 Virtual DOM 树**: 使用 "diff" 算法来比较新生成的 Virtual DOM 树与旧的 Virtual DOM 树。

4. **节点对比**:
   - **类型不同**: 如果新旧 VNode 类型不同（例如，一个是 `div`，另一个是 `p`），则会直接替换旧节点及其子节点。
   - **类型相同，但 key 不同**: 如果类型相同但 `key` 属性不同，也会直接替换。
   - **类型与 key 相同**: 进一步比较这两个节点的属性和子节点。

5. **属性对比**: 对于类型和 `key` 相同的节点，Vue 会对比两个节点的属性（如 `class`、`style`、自定义属性等）并更新变更的属性。

6. **子节点对比**: 接下来是子节点的对比，这是一个相对复杂的过程，涉及到列表对比算法。
   
   - **单个子节点与多个子节点**: Vue 会识别这种简单情况并做相应优化。
   - **使用 key 进行优化**: 对于有 `key` 的子节点，Vue 会基于 `key` 创建一个映射，以便快速找到对应节点。
   - **最长稳定子序列优化**: 对于列表渲染，Vue 使用一个名为 "最长稳定子序列"（Longest Stable Subsequence, LSS）的算法来最小化节点的移动。

7. **执行 DOM 更新**: 根据以上比较结果，Vue 会生成一组 DOM 更新指令（也称为 "patches"）并应用到真实的 DOM 上。

8. **生命周期钩子和指令**: 在整个 Diff 和 Patch 过程中，相关的生命周期钩子（如 `updated`、`mounted` 等）和自定义指令会被适当地调用。

9. **完成更新**: 至此，整个 DOM 更新过程完成，组件渲染出的界面会与新的状态同步。

这个流程非常高效，因为它只触及需要更新的 DOM 节点，而不是重新创建整个 DOM 树。这一切都是 Vue 的响应式系统和 Virtual DOM 机制共同作用的结果。这也是为什么 Vue 3 在性能和灵活性方面表现得如此出色的原因之一。

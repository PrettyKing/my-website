---
title: vue移动端滚动穿透问题
date: 2019-09-21
tags:
 - question
categories:
 - 问题积累
---

### 问题起因：
在一个可滑动列表页弹出一个全屏蒙层，蒙层固定，中间一块显示消息框，当用手滑动蒙层空白处时，滑动事件会穿透到底部列表页，导致列表页的滑动。

### 实现目标：
1. 滑动蒙层空白处不让滑动事件穿透。
2. 当蒙层消息框文字多时，要让文字可上下滑动。

### 实现思路：
1. vue提供的 @touchmove.prevent 可以用来阻止滑动，但是这个方法会对其内的子div的滑动事件也禁止掉了，这样会导致中间文字无法滑动。如果没有中间滑动需求，用 @touchmove.prevent 实现是一个很好的方法。
2. 蒙层设为fixed悬浮在最上，底部列表设置overflow-y: hidden；这样可以列表内容就不可以滑了，但实际过程中没有效果，于是想到继续往列表父div向上追溯，对body和html标签设置相关样式，这样就控制住了底部列表滑动问题。
3. 蒙层空白处点击事件与中间文字点击事件处理，防止事件冒泡带来其他bug。
### 相关实现：
1. html代码都是比较简单，列表页for循环实现；蒙层用一个变量控制其显示和隐藏。但这里有几个注意点: a. 给上面列表的div动态绑定了 noScroll class，它的作用是当消息蒙层显示时切换到相关的css样式； b. 弹出的全屏蒙层，加有点击事件是为了点空白处让蒙层消失，但这里对显示的每行文字还加了@click.stop="messageTitleClick(num)"这个方法，为什么加它呢——是因为蒙层空白处的点击方法对整个蒙层都生效，在文字上加上这个方法可以屏蔽掉蒙层点击方法的影响，即使这个方法里什么也不做它也是有作用的，另外这个方法上加了stop是为了防止它的点击事件穿透到后面的div。代码如下:
 ``` html
  　　 <!-- 列表 -->
    <div :class="{noScroll: isShowPopup}">
      <div class="item" v-for="num in 50" @click="itemClick(num)">
        <div style="width:100%">点击item{{num}}</div>
      </div>
    </div>

　　 <!-- 蒙层 -->
    <div v-if="isShowPopup" class="popup" @click="popUpEmptyClick()">
      <div class="message">
        <p class="message-title" v-for="num in 30" @click.stop="messageTitleClick(num)">
          消息提示 {{num}}
        </p>
      </div>
    </div>
 ```

2. 给整个列表动态绑定的css如下:
``` css
/* 当前蒙层显示时生效 */
.noScroll {
  overflow-y: hidden;
}
```
3. 给列表整个div动态绑定 .noScroll 后，底部列表照样可以滑动，所以考虑继续向上追溯。利用watch监听蒙层是否显示，当显示时，设置body相应样式；但蒙层消失时，body样式恢复。但是在vue里怎么操作body里，虽然vue是数据驱动的，不提倡直接操作Dom。但此刻我也是没什么好办法了，就直接操作Dom了。如下：
``` javascript
 watch: {
  isShowPopup(newVal, oldVal) {
    if (newVal == true) {
      let cssStr = "overflow-y: hidden; height: 100%;";
      document.getElementsByTagName('html')[0].style.cssText = cssStr;
      document.body.style.cssText = cssStr;
    } else {
      let cssStr = "overflow-y: auto; height: auto;";
      document.getElementsByTagName('html')[0].style.cssText = cssStr;
      document.body.style.cssText = cssStr;
    }

    // 下面需要这两行代码，兼容不同浏览器
    document.body.scrollTop = this.pageScrollYoffset;
    window.scroll(0, this.pageScrollYoffset);
  }
}
```

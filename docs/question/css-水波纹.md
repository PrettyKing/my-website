---
title: css水波纹
date: 2021-09-01
tags:
 - question
categories:
 - css技巧
---

```html
<style>
    .wave-content {
        height: 666px;
        width: 666px;
        left: 255px;
        top: 139px;
        position: relative;
    }

    .wave {
        position: absolute;
        left: 0px;
        top: 0px;
        height: 100%;
        width: 100%;
        transform-origin: center center;
        background-color: transparent;
        border: 1px solid #979797;
        animation-duration: 7s;
        animation-name: wv;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        border-radius: 50%;
        opacity: 0;
    }

    .wave1 {
        animation-delay: 0s;
    }

    .wave2 {
        animation-delay: 1.5s;
    }

    .wave3 {
        animation-delay: 3s;
    }

    .wave4 {
        animation-delay: 4.5s;
    }

    @keyframes wv {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }

        30% {
            opacity: 0.7;
            transform: scale(0.65);
        }

        70% {
            opacity: 0.1;
            transform: scale(0.85);
        }

        100% {
            opacity: -0.2;
            transform: scale(1);
        }
    }
</style>
<div class="wave-content ">
    <div class="wave wave1 "></div>
    <div class="wave wave2 "></div>
    <div class="wave wave3 "></div>
    <div class="wave wave4"></div>
</div>
```


---
title: css一直旋转的图片
date: 2021-08-31
tags:
 - question
categories:
 - css技巧
---

```html
<style>
    .logo {
        text-align: center;
        margin-top: 100px;
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    .Rotation {
        animation: rotation 8s linear infinite;
    }

    .img {
        border-radius: 200px;
    }
</style>
<div class="logo">
    <img class="Rotation img" src="http://cdn.jingqueyun.com/turntable/image/theme/theme2/turntable-outer-bg2.png"
        width="128" height="128" />
</div>

```


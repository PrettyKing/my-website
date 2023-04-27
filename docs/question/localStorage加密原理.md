---
title: LocalStorage 加密原理
date: 2021-07-18
tags:
 - question
categories:
 - 问题积累
---

### LocalStorage

要做可靠的本地数据加密，只能依靠单向加密算法如DES、AES或HMAC等
需要时secret随服务器响应发送到客户端进行解密

### 示例:本地localStorage aes加密

```js
const key = CryptoJS.enc.Utf8.parse("N2841A3412APCD6F"); //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse("AUCDTF12H41P34Y2"); //十六位十六进制数作为密钥偏移量
//解密方法
function Decrypt (word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
//加密方法
function Encrypt (word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString().toUpperCase();
}

/** 存入本地*/
function setToken (key, stringVal) {
    try {
        if (!localStorage) {
            return false;
        }
        var tem = new Date() - 1; // 当前的时间搓
        var today = new Date();
        let ZeroTime = new Date(new Date().toLocaleDateString()).getTime(); // 今天0点的时间戳
        var time = ZeroTime + 22 * 60 * 60 * 1000; // 晚上十点的时间戳
        // var time = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 22).getTime() // 过期时间
        if (time > tem) {
            //当前的时间戳大于过期的 时间戳
            var cacheExpireDate = time;
        } else {
            var cacheExpireDate = time + 24 * 60 * 60 * 1000; // 过期时间
        }
        var cacheVal = { val: stringVal, exp: cacheExpireDate };
        localStorage.setItem(Encrypt(key), Encrypt(JSON.stringify(cacheVal))); // 存入缓存值
        // console.log(key+":存入缓存，"+new Date(cacheExpireDate)+"到期");
    } catch (e) {
        console.log(e);
    }
}
function getToken (key) {
    // 取
    try {
        if (!localStorage) {
            return false;
        }
        var cacheVal = localStorage.getItem(Encrypt(key));
        var result = JSON.parse(Decrypt(cacheVal));
        var now = new Date() - 1; // 当前时间搓
        if (!result) {
            return null;
        } //缓存不存在 // 本地时间
        if (now > result.exp) {
            //缓存过期
            console.log(Encrypt(key));
            removelocalStorage(Encrypt(key));
            return "";
        }
        return result.val;
    } catch (e) {
        removelocalStorage(key);
        return null;
    }
}

/**移除缓存，一般情况不手动调用，缓存过期自动调用*/
function removelocalStorage (key) {
    if (!localStorage) {
        return false;
    }
    localStorage.removeItem(key);
}
```


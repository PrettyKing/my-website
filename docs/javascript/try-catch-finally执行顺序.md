---
title: 有return的情况下try catch finally的执行顺序
date: 2021-01-19
tags:
 - tools
categories:
 - 工具人
---

***结论：***
1. 不管有没有出现异常，最后块中代码都会执行;
2. 当尝试和捕获中有返回时，最后仍然会执行;
3. 最后是在返回后面的表达式运算后执行的（此时并没有返回运算后的值，而是先把要返回的值保存起来，不管最后中的代码怎么样，返回的值都不会改变，任然是之前保存的值），所以函数返回值是在最后执行前确定的;
4. 最后中间好不要包含返回，否则程序会提前退出，返回值不是try或catch中保存的返回值。



举例：
- 情况1：try{} catch(){}finally{} return;
  
    > 显然程序按顺序执行。
    
- 情况2:try{ return; }catch(){} finally{} return;
  
     > 1. 程序执行try块中return之前（包括return语句中的表达式运算）代码；
     > 2. 再执行finally块，最后执行try中return;
     > 3. finally块之后的语句return，因为程序在try中已经return所以不再执行。
     
- 情况3:try{ } catch(){return;} finally{} return;
  
     > 1. 程序先执行try，如果遇到异常执行catch块，
     > 2. 有异常：则执行catch中return之前（包括return语句中的表达式运算）代码，再执行finally语句中全部代码，
     >       1. 最后执行catch块中return. finally之后也就是4处的代码不再执行。
     > 3. 无异常：执行完try再finally再return.
     
- 情况4:try{ return; }catch(){} finally{return;}
  
     > 1. 程序执行try块中return之前（包括return语句中的表达式运算）代码；
     > 2. 再执行finally块，因为finally块中有return所以提前退出。
     
- 情况5:try{} catch(){return;}finally{return;}
  
     > 1. 程序执行catch块中return之前（包括return语句中的表达式运算）代码；
     > 2. 再执行finally块，因为finally块中有return所以提前退出。
     
- 情况6:try{ return;}catch(){return;} finally{return;}
  
     >1. 程序执行try块中return之前（包括return语句中的表达式运算）代码；
     >2. 有异常：执行catch块中return之前（包括return语句中的表达式运算）代码；
     >        1.  则再执行finally块，因为finally块中有return所以提前退出。
     >3. 无异常：则再执行finally块，因为finally块中有return所以提前退出。
     
     
::: tip 最终结论
任何执行try 或者catch中的return语句之前，都会先执行finally语句，如果finally存在的话。如果finally中有return语句，那么程序return了，所以finally中的return是一定会被return的， 编译器把finally中的return实现为一个warning。
:::
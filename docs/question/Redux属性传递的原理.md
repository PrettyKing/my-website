---
title: Redux怎么实现属性传递，介绍下原理
date: 2021-06-21
tags:
 - question
categories:
 - 问题积累
---



> react-redux 数据传输: view- ->action- ->reducer-->store-->view

具体点击事件的数据通过redux传到view上：

1. view 上的ADDClick事件，通过mapDispatchToProps 把数据传到action ---> click: ( ) =>dispatch ( ADD )
2. action的ADD 传到 reducer上
3. reducer传到store上 const store = createStore ( reducer ) ;
4. store 通过 mapStateToProps 映射到view上

具体代码实现：

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
class App extends React.Component{
    render(){
        let { text, click, clickR } = this.props;
        return(
            <div>
                <div>数据:已有人{text}</div>
                <div onClick={click}>加人</div>
                <div onClick={clickR}>减人</div>
            </div>
        )
    }
}
const initialState = {
    text:5
}
const reducer = function(state,action){
    switch(action.type){
        case 'ADD':
            return {text:state.text+1}
        case 'REMOVE':
            return {text:state.text-1}
        default:
            return initialState;
    }
}

let ADD = {
    type:'ADD'
}
let Remove = {
    type:'REMOVE'
}

const store = createStore(reducer);

let mapStateToProps = function (state){
    return{
        text:state.text
    }
}

let mapDispatchToProps = function(dispatch){
    return{
        click:()=>dispatch(ADD),
        clickR:()=>dispatch(Remove)
    }
}

const App1 = connect(mapStateToProps,mapDispatchToProps)(App);

ReactDOM.render(
    <Provider store = {store}>
        <App1></App1>
    </Provider>,document.getElementById('root')
)
```




"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[8435],{3905:(e,n,r)=>{r.d(n,{Zo:()=>p,kt:()=>k});var t=r(7294);function o(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function a(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function c(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?a(Object(r),!0).forEach((function(n){o(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function l(e,n){if(null==e)return{};var r,t,o=function(e,n){if(null==e)return{};var r,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(o[r]=e[r]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var i=t.createContext({}),s=function(e){var n=t.useContext(i),r=n;return e&&(r="function"==typeof e?e(n):c(c({},n),e)),r},p=function(e){var n=s(e.components);return t.createElement(i.Provider,{value:n},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},m=t.forwardRef((function(e,n){var r=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=s(r),m=o,k=d["".concat(i,".").concat(m)]||d[m]||u[m]||a;return r?t.createElement(k,c(c({ref:n},p),{},{components:r})):t.createElement(k,c({ref:n},p))}));function k(e,n){var r=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=r.length,c=new Array(a);c[0]=m;var l={};for(var i in n)hasOwnProperty.call(n,i)&&(l[i]=n[i]);l.originalType=e,l[d]="string"==typeof e?e:o,c[1]=l;for(var s=2;s<a;s++)c[s]=r[s];return t.createElement.apply(null,c)}return t.createElement.apply(null,r)}m.displayName="MDXCreateElement"},6438:(e,n,r)=>{r.r(n),r.d(n,{contentTitle:()=>c,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>i});var t=r(7462),o=(r(7294),r(3905));const a={title:"Docker \u955c\u50cf\u6253\u5305\u548c\u53d1\u5e03\u57fa\u672c\u6d41\u7a0b",date:new Date("2021-03-06T00:00:00.000Z"),tags:["tools"],categories:["\u6d41\u7a0b"]},c=void 0,l={unversionedId:"other/docker-publish",id:"other/docker-publish",isDocsHomePage:!1,title:"Docker \u955c\u50cf\u6253\u5305\u548c\u53d1\u5e03\u57fa\u672c\u6d41\u7a0b",description:"\u521b\u5efa\u4e00\u4e2a\u7b80\u6613\u7684\u9879\u76ee",source:"@site/docs/other/docker-publish.md",sourceDirName:"other",slug:"/other/docker-publish",permalink:"/my-website/docs/other/docker-publish",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/other/docker-publish.md",version:"current",frontMatter:{title:"Docker \u955c\u50cf\u6253\u5305\u548c\u53d1\u5e03\u57fa\u672c\u6d41\u7a0b",date:"2021-03-06T00:00:00.000Z",tags:["tools"],categories:["\u6d41\u7a0b"]},sidebar:"defaultSidebar",previous:{title:"C++ \u901f\u6210",permalink:"/my-website/docs/other/CPP"},next:{title:"BFC\u76f8\u5173",permalink:"/my-website/docs/question/BFC"}},i=[{value:"\u521b\u5efa\u4e00\u4e2a\u7b80\u6613\u7684\u9879\u76ee",id:"\u521b\u5efa\u4e00\u4e2a\u7b80\u6613\u7684\u9879\u76ee",children:[]},{value:"\u6253\u5305\u955c\u50cf",id:"\u6253\u5305\u955c\u50cf",children:[]},{value:"\u53d1\u5e03\u955c\u50cf",id:"\u53d1\u5e03\u955c\u50cf",children:[]}],s={toc:i},p="wrapper";function d(e){let{components:n,...r}=e;return(0,o.kt)(p,(0,t.Z)({},s,r,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"\u521b\u5efa\u4e00\u4e2a\u7b80\u6613\u7684\u9879\u76ee"},"\u521b\u5efa\u4e00\u4e2a\u7b80\u6613\u7684\u9879\u76ee"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"\u76ee\u5f55\u7ed3\u6784\u5982\u4e0b"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-js"},".\n\u251c\u2500\u2500 .dockerignore\n\u251c\u2500\u2500 Dockerfile\n\u251c\u2500\u2500 node_modules\n\u251c\u2500\u2500 package-lock.json // \u5fc5\u987b\u6709\uff0c\u5426\u5219\u5728docker push\u65f6\u4f1a\u8b66\u544a\n\u251c\u2500\u2500 package.json\n\u251c\u2500\u2500 server.js\n\u2514\u2500\u2500 yarn.lock\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"server.js"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-js"},"const Koa = require('koa');\nconst app = new Koa();\napp.use(async ctx => {\n   ctx.body = 'Hello docker';\n});\napp.listen(3000);\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Package.json"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-json"},'{\n    "name": "docker_demo",\n    "version": "1.0.0",\n    "description": "docker build test", // \u5fc5\u987b\u6709\uff0c\u5426\u5219\u5728docker push\u65f6\u4f1a\u8b66\u544a\n    "main": "index.js",\n    "scripts": {\n        "start": "node server.js"\n    },\n    "keywords": [],\n    "author": "",\n    "license": "ISC",\n    "dependencies": {\n        "koa": "^2.13.1"\n    },\n    "repository": { // \u5fc5\u987b\u6709\uff0c\u5426\u5219\u5728docker push\u65f6\u4f1a\u8b66\u544a\n        "type": "git",\n        "url": "http://github.com"\n    }\n}\n'))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},".dockerignore"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"# Logs\nlogs\n*.log\nnpm-debug.log*\n# Runtime data\npids\n*.pid\n*.seed\n# Directory for instrumented libs generated by jscoverage/JSCover\nlib-cov\n# Coverage directory used by tools like istanbul\n# Logs\nlogs\n*.log\nnpm-debug.log*\n# Runtime data\npids\n*.pid\n*.seed\n# Directory for instrumented libs generated by jscoverage/JSCover\nlib-cov\n# Coverage directory used by tools like istanbul\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Dockerfile"),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-js"},'#\u5236\u5b9anode\u955c\u50cf\u7684\u7248\u672c\nFROM node:8.9-alpine\n#\u58f0\u660e\u4f5c\u8005\nMAINTAINER chalee \n#\u79fb\u52a8\u5f53\u524d\u2f6c\u76ee\u5f55\u4e0b\u2faf\u9762\u7684\u2f42\u6587\u4ef6\u5230app\u2f6c\u76ee\u5f55\u4e0b \nADD . /app/ \n#\u8fdb\u2f0a\u5165\u5230app\u2f6c\u76ee\u5f55\u4e0b\u2faf\u9762\uff0c\u7c7b\u4f3ccd \nWORKDIR /app\n#\u5b89\u88c5\u4f9d\u8d56\nRUN npm install\n#\u5bf9\u5916\u66b4\u66b4\u9732\u9732\u7684\u7aef\u2f1d\u53e3\nEXPOSE 3000\n#\u7a0b\u5e8f\u542f\u52a8\u811a\u672c\nCMD ["npm", "start"]\n')))),(0,o.kt)("h2",{id:"\u6253\u5305\u955c\u50cf"},"\u6253\u5305\u955c\u50cf"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"# \u6784\u5efa\u955c\u50cf\ndocker build -t docker_demo .\n# \u8fd0\u884c\u955c\u50cf\ndocker run -d -p 9000:3000 docker_demo\n# \u67e5\u770b\u955c\u50cf\ndocker ps \n# \u5220\u9664\u955c\u50cf\ndocker rmi \u955c\u50cfID\n# \u5220\u9664\u8fd0\u884c\u7684\u955c\u50cf \uff08\u5fc5\u987b\u5148\u505c\u6b62\u955c\u50cf\uff09\ndocker rm \u955c\u50cfID\n")),(0,o.kt)("h2",{id:"\u53d1\u5e03\u955c\u50cf"},"\u53d1\u5e03\u955c\u50cf"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"# \u767b\u5f55docker hub (\u9700\u8981root\u6743\u9650)\nsudo docker login\n# \u7ed9\u955c\u50cf\u6253tag \uff08\u53d1\u5e03\u65f6\u9700\u8981\uff09766c9b622783-> \u955c\u50cfID chaleechen->docker\u7528\u6237\u540d \u955c\u50cf\u540d\u79f0\ndocker tag 766c9b622783 chaleechen/docker_demo\n# \u53d1\u5e03\u955c\u50cf\nsudo docker push chaleechen/docker_demo:latest\n# https://hub.docker.com/repositories \u67e5\u770b\u4ed3\u5e93\u5c31\u4f1a\u53d1\u73b0\u521a\u521a\u6253\u5305\u597d\u7684\u955c\u50cf\n\n# \u67e5\u770b\u81ea\u5df1\u53d1\u5e03\u7684\u955c\u50cf\ndocker search chaleechen/docker_demo\n# \u62c9\u53d6\u81ea\u5df1\u53d1\u5e03\u7684\u955c\u50cf\ndocker pull chaleechen/docker_demo\n")))}d.isMDXComponent=!0}}]);
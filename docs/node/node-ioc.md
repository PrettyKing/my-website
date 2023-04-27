---
title: NodeJS 面向切面编程
date: 2020-12-16
author: 卫辰
---

## 一段帮助理解面向切面编程的代码

- Package.json

```json
// 摘抄部分重要
{
  "scripts": {
    "dev": "ts-node app.ts"
  },
  "dependencies": {
    "global": "^4.4.0",
    "inversify": "^5.0.5",
    "reflect-metadata": "^0.1.13",
    "ts-node": "^9.1.1",
    "typescript": "^4.1.3"
  }
}
```

- Interfaces.ts （个人感觉更像java里面的service 接口层）

```typescript
interface Student {
  learn(): string;
}

interface Teacher {
  teaching(): string;
}

interface Classroom {
  study(): string;
}

export { Student, Teacher, Classroom };
```

- Entities.ts	(这个像Java里面的接口实现Impl)

```typescript
import { Classroom, Student, Teacher } from './interfaces';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import TYPES from './types';

@injectable()  // 这里的意思有点像 @Service注解  这里也是起注入功能
class XiaoMing implements Student {
  public learn() {
    return '👊努力学习';
  }
}

@injectable()  
class Zhijia implements Teacher {
  public teaching() {
    return '教高级前端 🌶';
  }
}

@injectable()
class Yd implements Classroom {
  private _xiaoming: Student;
  private _zhijia: Teacher;
  constructor(@inject(TYPES.Student) xiaoming, @inject(TYPES.Teacher) zhijia) {
    this._xiaoming = xiaoming;
    this._zhijia = zhijia;
  }
  public study() {
    return this._zhijia.teaching() + this._xiaoming.learn();
  }
}

export { XiaoMing, Zhijia, Yd };
```

- inversify.config.ts (这里把service 跟service实现注入到容器中)

```typescript
import { Container } from 'inversify';
import { XiaoMing, Yd, Zhijia } from './entities';
import { Classroom, Student, Teacher } from './interfaces';
import Types from './types';

const container = new Container();

container.bind<Student>(Types.Student).to(XiaoMing);
container.bind<Teacher>(Types.Teacher).to(Zhijia);
container.bind<Classroom>(Types.Classroom).to(Yd);

export default container;
```

- app.ts (主程序)

```typescript
import container from './inversify.config';
import TYPES from './types';
import { Classroom } from './interfaces';

const classroom = container.get<Classroom>(TYPES.Classroom);
console.log(classroom.study());


// 运行 yarn dev 展示如下结果	
// yarn run v1.22.4
// $ ts-node app.ts
// 教高级前端 🌶👊努力学习

```

- 其他： tsconfig.json 配置摘要

```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["dom","es6"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```



## 面向切面编程更进一步



#### books demo改写，利用awilix库实现一个简单ioc 的nodejs应用 

- Package.json

```json
// 部分主要代码
{
  "scripts": {
    "start": "ts-node-dev --respawn --transpile-only app.ts"
  },
  "dependencies": {
    "@types/koa-router": "^7.4.1",
    "awilix": "^4.3.1",	//	ioc入门的nodejs库
    "awilix-koa": "^4.0.0",	//	整合koa
    "co": "^4.6.0",				//	主要处理异步结果的返回
    "koa": "^2.13.0",
    "koa-router": "^10.0.0",
    "koa-swig": "^2.2.1",
    "ts-node-dev": "^1.0.0"
  },
  "devDependencies": {
    "@types/co": "^4.6.2",
    "@types/koa": "^2.11.6",
    "typescript": "^4.1.2"
  },
}

```

- interface目录

```typescript
// IData.ts
export interface IData {
  item: string;
}

// IApi.ts
import { IData } from './IData';

export interface IApi {
  getInfo(): Promise<IData>;
}

// IKoa.ts
import Koa from 'koa';
import render from 'koa-swig';

export interface Context extends Koa.Context {
  render: typeof render;
}
```

- service目录

```typescript
// ApiService.ts
import { IApi } from '../interface/IApi';
import { IData } from '../interface/IData';

class ApiService implements IApi {  // 这里实现interface中定义的IApi接口
  getInfo() {
    return new Promise<IData>((resolve) => {  //	一个简单的promis返回数据
      resolve({
        item: '后台数据🌺',
      });
    });
  }
}
export default ApiService;  //导出

```

- Router (其实这里我觉得更像 controller层)

```typescript
// ApiController.ts
import { GET, route } from 'awilix-koa';
import * as Router from 'koa-router';
import { IApi } from '../interface/IApi';

@route('/api')
class ApiController {
  //	创建私有变量
  private apiService: IApi;
	// 这里把  apiServices 注入到 ApiController 中
  constructor({ apiServices }) {
    this.apiService = apiServices;
  }
  
  @route('/list')  // 路由：访问 http://localhost:3000/api/list
  @GET()          // 访问的请求方式： 这里为GET
  async actionList(
    ctx: Router.IRouterContext,
    next: () => Promise<unknown>
  ): Promise<any> {
    const data = await this.apiService.getInfo();
    ctx.body = {
      data,
    };
  }
}
export default ApiController;



//	IndexController.ts
import { GET, route } from 'awilix-koa';
import { Context } from '../interface/IKoa';

@route('/')
class ApiController {
  @route('/')   // 通过访问根路径，渲染一个 html
  @GET()
  async actionIndex(ctx: Context): Promise<void> {
    ctx.body = await ctx.render('index');
  }
}
export default ApiController;
```

- App.ts

```typescript
import * as Koa from 'koa';
//用IOC的方式管理路由
import { createContainer, Lifetime } from 'awilix';
import { loadControllers, scopePerRequest } from 'awilix-koa';
// swig模版包
import render from 'koa-swig';
import co from 'co';
import { join } from 'path';

const app = new Koa();
//	初始化容器 IOC
const container = createContainer();
//	注入写好的service
container.loadModules([`${__dirname}/services/*.ts`], {
  formatName: 'camelCase',  //驼峰式命名
  resolverOptions: {
    lifetime: Lifetime.SCOPED,	//生命周期 
  },
});
//	模版渲染配置
app.context.render = co.wrap(  // 这里用co.wrap包裹主要是解决异步结果的返回
  render({
    root: join(__dirname, 'views'),
    autoescape: true,
    cache: 'memory',
    ext: 'html',
    writeBody: false,
  })
);

//	融合Koa
app.use(scopePerRequest(container));
app.use(loadControllers(`${__dirname}/routers/*.ts`));

app.listen(3000, () => {
  console.log('TS AOP Node框架启动成功');
});
```

- typings

```typescript
//koa-swig.d.ts
// 这里主要是针对 koa-swig 的ts支持.d.ts文件
declare module 'koa-swig' {
  function render<T>(value: T | render.DefaultSettings): any;
  namespace render {
    interface DefaultSettings {
      root: string;
      autoescape: boolean;
      cache: string;
      ext: string;
      writeBody: boolean;
    }
  }
  export default render;
}
```

- views

```html
<!-- 静态文件 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TS的项目首页</title>
  </head>
  <body>
    <h1>这里是首页🏮</h1>
  </body>
</html>
```



- 最终的的demo目录

```markdown
.
├── app.ts
├── interface
│   ├── IApi.ts
│   ├── IData.ts
│   └── IKoa.ts
├── package.json
├── routers
│   ├── ApiController.ts
│   └── IndexController.ts
├── services
│   └── ApiServices.ts
├── tsconfig.json
├── typings
│   └── koa-swig.d.ts
├── views
│   └── index.html
├── yarn-error.log
└── yarn.lock
```

## 面向切面编程高级： inversify的使用

#### 使用inversify对books重构，这里的inversely 更贴近面向切面编程

- Package.json

```json
{
   "scripts": {
    "dev": "ts-node app.ts"
  },
  "dependencies": {
    "@types/koa-router": "^7.4.1",
    "inversify": "^5.0.5",
    "inversify-binding-decorators": "^4.0.0",
    "inversify-koa-utils": "^1.0.0",
    "reflect-metadata": "^0.1.13",
    "ts-node": "^9.1.1",
    "typescript": "^4.1.3"
  }
}
```

- interface

```typescript
// IData.ts
export interface IData {
  item: string;
}

// IApi.ts
import { IData } from './IData';

export interface IApi {
  getInfo(): Promise<IData>;
}

// IKoa.ts
import Koa from 'koa';
import render from 'koa-swig';

export interface Context extends Koa.Context {
  render: typeof render;
}
```

- contant(常量)

```typescript
// tags.ts
const TAGS = {
  IndexService: Symbol.for('IndexService'),
};
export default TAGS;
```

- controller

```typescript
import { interfaces, controller, httpGet, TYPE } from 'inversify-koa-utils';
import { IApi } from '../interface/IApi';
import { provideThrowable } from '../ioc';
import { inject } from 'inversify';
import TAGS from '../constant/tags';
import { IRouterContext } from 'koa-router';

@controller('/')
@provideThrowable(TYPE.Controller, 'IndexController')
export default class IndexController implements interfaces.Controller {
  private indexService: IApi;
  constructor(@inject(TAGS.IndexService) indexService) {
    this.indexService = indexService;
  }
  @httpGet('/')
  private async index(
    ctx: IRouterContext,
    next: () => Promise<unknown>
  ): Promise<any> {
    const data = await this.indexService.getInfo();
    ctx.body = {
      data,
    };
  }
}

// 1.定义interfaces
// 2.定义常量 注入容器
// 3.插入到构造函数中 注入过程

```

- ioc

```typescript
// index.ts
import { fluentProvide } from 'inversify-binding-decorators';

let provideThrowable = (identifier, name) => {
  return fluentProvide(identifier).whenTargetNamed(name).done();
};
export { provideThrowable };

//loader.ts
import '../controllers/IndexController';
import '../services/IndexService';
```

- 可以新增model层

```typescript
//Data.ts
export namespace Model {
  export class User {
    name: string;
    email: string;
  }
}
// Model.User

```

- App.ts

```typescript
import 'reflect-metadata';
import './ioc/loader';
import { InversifyKoaServer } from 'inversify-koa-utils';
import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

const container = new Container();
container.load(buildProviderModule());

let server = new InversifyKoaServer(container);
let app = server.build();

app.listen(3000, () => {
  console.log('Inversify Server 启动成功');
});
```

- 其他：tsconfig.json

```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es6"],
        "types": ["reflect-metadata"],
        "module": "commonjs",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

- 最终代码目录

```markdown
.
├── app.ts
├── constant
│   └── tags.ts
├── controllers
│   └── IndexController.ts
├── interface
│   ├── IApi.ts
│   ├── IData.ts
│   └── IKoa.ts
├── ioc
│   ├── index.ts
│   └── loader.ts
├── models
│   └── Data.ts
├── package.json
├── services
│   └── IndexService.ts
├── tsconfig.json
├── yarn-error.log
└── yarn.lock
```




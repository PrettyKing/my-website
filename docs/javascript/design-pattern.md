---
title: 设计模式
date: 2021-03-02
author: 卫辰
---



## 导论

- 《设计模式》一书自1995年成书一来，一直 是程序员谈论的“高端”话题之一。许多程序员从 设计模式中学到了设计软件的灵感，或者找到了 问题的解决答案。在社区中，即有人对模式无比 崇拜，也有人对模式充满误解。有些程序员把设 计模式视为圣经，唯模式至上;有些人却认为设 计模式只在C++或者Java中用武之地，JavaScript 这种动态语言没有设计模式一说。

## 起源

- 设计模式并非是软件开发中的专业术语。实 际上“模式”最早诞生于建筑学。20世纪70年 代，哈佛大学建筑学博士和他的研究团队花了约 20年的时间，研究了为解决同一问题而设计出不 同结构建筑，从中发现了那些高质量设计中的相 似性，并且用“模式”来指代相似性。 
- 设计模式:在面向对象软件设计过程中针对特定问题的简洁而优雅的解决方案。

## 几种常见的设计模式

### 单例模式

- 定义：保证一个类只有一个实例，并提供一个访问 它的全局访问点，如window对象。当我们单击登 录按钮的时候页面出现一个登陆浮窗，这个悬浮 窗是唯一的，无论单击多少次登陆按钮，这个浮 窗都只会被创建一次，这个登陆的浮窗就适合用 单例模式创建。

- code

  ```typescript
  class Singleton {
    private static instance: Singleton = null;
    constructor() {}
    public static getInstance(): Singleton {
      if (this.instance == null) {
        this.instance = new Singleton();
      }
      return this.instance;
    }
  }
  ```

  

### 工厂模式

- 工厂模式是我们最常用的实例化对象模式了，是用工 厂方法代替new操作的一种模式。著名的Jive论坛 ,就 大量使用了工厂模式，工厂模式在Java程序系统可以 说是随处可见。因为工厂模式就相当于创建实例对象 的new，我们经常要根据类Class生成实例对象，如A a=new A() 工厂模式也是用来创建实例对象的，所以 以后new时就要多个心眼，是否可以考虑使用工厂模 式，虽然这样做，可能多做一些工作，但会给你系统 带来更大的可扩展性和尽量少的修改量。

- code 

  ```typescript
  //抽象类
  abstract class INoodles {
    /**
     * 描述每种面条啥样的
     */
    public abstract desc(): void;
  }
  
  class LzNoodles extends INoodles {
    public desc(): void {
      console.log('兰州拉面 上海的好贵 家里才5 6块钱一碗');
    }
  }
  class PaoNoodles extends INoodles {
    public desc(): void {
      console.log('泡面好吃 可不要贪杯');
    }
  }
  class GankouNoodles extends INoodles {
    public desc(): void {
      console.log('还是家里的干扣面好吃 6块一碗');
    }
  }
  
  class SimpleNoodlesFactory {
    public static TYPE_LZ: number = 1; //兰州拉面
    public static TYPE_PM: number = 2; //泡面
    public static TYPE_GK: number = 3; //干扣面
  
    public static createNoodles(type: number): INoodles {
      switch (type) {
        case SimpleNoodlesFactory.TYPE_LZ:
          return new LzNoodles();
        case SimpleNoodlesFactory.TYPE_PM:
          return new PaoNoodles();
        case SimpleNoodlesFactory.TYPE_GK:
        default:
          return new GankouNoodles();
      }
    }
  }
  
  const noodles: INoodles = SimpleNoodlesFactory.createNoodles(
    SimpleNoodlesFactory.TYPE_GK
  );
  noodles.desc();
  ```

  

### 代理模式

- 为一个对象提供一个代用品或占位符，以便控制对它的访问。很多明星都有自己经纪人，比如开演唱会经纪人会代替明星细节和谈好报酬之后再跟明星签合同。即核心是当客户不方便直接访问一个对象或者不满足需要的时候，提供一个替身对象控制这个对象的访问，替身对象对请求最初一些处理之后再把请求转交给本体对象。

- code

  ```typescript
  interface IUserDao {
    save(): void;
  }
  /**
   * 接口实现
   * 目标对象
   */
  class UserDao implements IUserDao {
    public save(): void {
      console.log('----已经保存数据!----');
    }
  }
  
  /**
   * 代理对象,静态代理
   */
  class UserDaoProxy implements IUserDao {
    //接收保存目标对象
    private target: IUserDao;
    constructor(target: IUserDao) {
      this.target = target;
    }
    public save(): void {
      console.log('开始事务...');
      this.target.save(); //执行目标对象的方法
      console.log('提交事务...');
    }
  }
  
  // 业务逻辑 -》 开始执行代理
  //目标对象
  const target: UserDao = new UserDao();
  
  //代理对象,把目标对象传给代理对象,建立代理关系
  const proxy: UserDaoProxy = new UserDaoProxy(target);
  
  proxy.save(); //执行的是代理的方法
  
  ```

  

### 命令模式

- 命令模式中的命令指的是一个执行某些特定事情的指令，有时候需要向某些特定事情的指令。常见的应用场景有时候需要向某些对象发送请求，但是并不知道请求的接受者是谁，也不知道被请求的操作是什么。假如我们去快餐店，我们可以点餐取消餐但是我们并不用关心厨师是谁怎么做。

- code

  ```typescript
  // 1.接收者角色类
  class Receiver {
    /**
     * 真正执行命令相应的操作
     */
    public action(): void {
      console.log('执行操作');
    }
  }
  
  // 2.抽象命令角色类
  interface Command {
    /**
     * 执行方法
     */
    execute(): void;
  }
  
  // 3.具体命令角色类
  class ConcreteCommand implements Command {
    //持有相应的接收者对象
    private receiver: Receiver = null;
    /**
     * 构造方法
     */
    constructor(receiver: Receiver) {
      this.receiver = receiver;
    }
    public execute(): void {
      //通常会转调接收者对象的相应方法，让接收者来真正执行功能
      this.receiver.action();
    }
  }
  
  // 4.请求者角色类
  class Invoker {
    /**
     * 持有命令对象
     */
    private command: Command = null;
    /**
     * 构造方法
     */
    constructor(command: Command) {
      this.command = command;
    }
    /**
     * 行动方法
     */
    public action(): void {
      this.command.execute();
    }
  }
  
  //5.执行层
  
  //创建接收者
  const receiver: Receiver = new Receiver();
  //创建命令对象，设定它的接收者
  const command: Command = new ConcreteCommand(receiver);
  
  //创建请求者，把命令对象设置进去 发号命令
  const invoker: Invoker = new Invoker(command);
  //执行方法
  invoker.action();
  
  ```

  

### 发布订阅模式

- 发布-订阅模式又叫观察者模式，它定义对象 间的一种一对多的依赖关系，当一个对象的状态 发生改变时，所有依赖它的对象都将得到通知。 现实生活中，如我们去售楼中心服务人员A接待 了我们，然后再有客户找到A，这个时候暂时没 房了，等到有房的时候不可能服务人员A挨个打 电话通知而是订阅A的公共提醒服务。

- code

  ```typescript
  //观察者接口 （买房子的人）
  interface Observer {
    //当主题状态改变时,更新通知
    update(version: number): void;
  }
  // 小哥的公众号 大家都关注小哥的公众号
  interface Subject {
    //添加观察者
    addObserver(key: string, obj: Observer): void;
    //移除观察者
    deleteObserver(key: string): void;
    //当主题方法改变时,这个方法被调用,通知所有的观察者
    notifyObserver(): void;
  }
  // 某某杂志(卖房子的小哥)
  class MagazineSubject implements Subject {
    //存放订阅者
    // private List<Observer> observers = new ArrayList<Observer>();
    private observers: Map<string, Observer> = new Map<string, Observer>();
    //期刊版本
    private version: number = 0;
  
    public addObserver(key: string, obj: Observer): void {
      // observers.add(obj);
      this.observers.set(key, obj);
    }
  
    public deleteObserver(key: string): void {
      if (this.observers.has(key)) {
        this.observers.delete(key);
      } else {
        throw new Error(`Observer的对象上不存在${key}`);
      }
    }
  
    public notifyObserver(): void {
      for (const item of Array.from(this.observers)) {
        // console.log("🍌", item);
        const o: Observer = item[1];
        o.update(this.version);
      }
    }
  
    //该杂志发行了新版本
    public publish() {
      //新版本
      this.version++;
      //信息更新完毕，通知所有观察者
      this.notifyObserver();
    }
  }
  // 买房子的具体人 订阅杂志的人
  class CustomerObserver implements Observer {
    //订阅者名字
    private name: string;
    private version: number;
  
    constructor(name: string) {
      this.name = name;
    }
  
    public update(version: number): void {
      this.version = version;
      console.log('该杂志出新版本了');
      this.buy();
    }
  
    public buy(): void {
      console.log(`${this.name} + "购买了第" + ${this.version} + "期的杂志!"`);
    }
  }
  
  //创建主题(被观察者)
  const magazine: MagazineSubject = new MagazineSubject();
  //创建三个不同的观察者
  const a: CustomerObserver = new CustomerObserver('A');
  const b: CustomerObserver = new CustomerObserver('B');
  const c: CustomerObserver = new CustomerObserver('C');
  //将观察者注册到主题中
  magazine.addObserver('a', a);
  magazine.addObserver('b', b);
  magazine.addObserver('c', c);
  
  //更新主题的数据，当数据更新后，会自动通知所有已注册的观察者
  magazine.publish();
  ```

  

### 职责链模式

- 使多个对象都有机会处理请求，从而避免请求的发送者和接受者之间的耦合关系，将这些关系连成一条链，并沿着这条链传递该请求，直到一个对象处理它为止。现实生活中如我们座公交车人太多，我们把公交卡交给售票员，让前面的人不停的往前递直到售票员刷卡结束。
    
- code

  ```typescript
  abstract class Handler {
    public sucesser: Handler;
    //定义一个抽象的处理请求的方法
    public abstract handlerRequest(user: string, days: number): void;
  
    //获取当前角色的下一个处理者角色
    public getNextHandler(): Handler {
      return this.sucesser;
    }
    //设置当前角色的下一个处理者角色
    public setNextHandler(sucesser: Handler): void {
      this.sucesser = sucesser;
    }
  }
  //班主任处理请假请求
  class HeadTeacher extends Handler {
    public handlerRequest(user: string, days: number): string {
      if (days < 5) {
        console.log('班主任同意' + user + '同学的请假请求');
      } else {
        console.log('班主任无法处理' + user + '同学的请假请求');
      }
      // 如果下一个执行者不为空，由下一个执行者执行
      if (this.getNextHandler() != null) {
        const nextHandler = this.getNextHandler();
        nextHandler.handlerRequest(user, days);
        return;
        // return this.getNextHandler().handlerRequest(user, days);
      }
      return null;
    }
  }
  //院系主任处理请假请求
  class Department extends Handler {
    public handlerRequest(user: string, days: number): string {
      if (days < 30) {
        console.log('院系主任同意' + user + '同学的请假请求');
      } else {
        console.log('院系主任无法处理' + user + '同学的请假请求');
      }
      if (this.getNextHandler() != null) {
        const nextHandler = this.getNextHandler();
        nextHandler.handlerRequest(user, days);
        return;
      }
      return null;
    }
  }
  //校级主任处理请假请求
  class Leader extends Handler {
    public handlerRequest(user: string, days: number): string {
      if (days >= 30) {
        console.log('校级主任同意' + user + '同学的请假请求');
      } else if (this.getNextHandler() != null) {
        const nextHandler = this.getNextHandler();
        nextHandler.handlerRequest(user, days);
        return;
        //return getNextHandler().handlerRequest(user, days);
      }
      return null;
    }
  }
  class SimpleFactory {
    public static TYPE_HeadTeacher: number = 1; //兰州拉面
    public static TYPE_Department: number = 2; //泡面
    public static TYPE_Leader: number = 3; //干扣面
  
    public static createHandler(type: number): Handler {
      switch (type) {
        case SimpleFactory.TYPE_HeadTeacher:
          return new HeadTeacher();
        case SimpleFactory.TYPE_Department:
          return new Department();
        case SimpleFactory.TYPE_Leader:
        default:
          return new Leader();
      }
    }
  }
  // 获取三个不同的处理者对象
  const h1: Handler = SimpleFactory.createHandler(SimpleFactory.TYPE_HeadTeacher);
  const h2: Handler = SimpleFactory.createHandler(SimpleFactory.TYPE_Department);
  const h3: Handler = SimpleFactory.createHandler(SimpleFactory.TYPE_Leader);
  // 设置角色的处理层次
  h1.setNextHandler(h2);
  h2.setNextHandler(h3);
  
  h1.handlerRequest('李四', 35);
  // console.log("*************************");
  // h2.handlerRequest("王五", 15);
  // console.log("*************************");
  // h2.handlerRequest("朱七", 30);
  
  ```

  

### 依赖注入

```typescript
interface IContainer<T extends new () => any> {
  callback: () => InstanceType<T>;
  singleton: boolean;
  instance?: InstanceType<T>;
}
interface NewAble<T> {
  new (...args: any[]): T;
}
type TBind<T> = [key: string, Fn: NewAble<T>];
class CreateIoc {
  private container = new Map<PropertyKey, IContainer<any>>();
  public bind<T>(...parms: TBind<T>) {
    this.helpBind(parms, false);
  }
  public singleton<T>(...parms: TBind<T>) {
    this.helpBind(parms, true);
  }
  private helpBind<T>(parms: TBind<T>, singleton: boolean) {
    const [key, Fn] = parms;
    const callback = () => new Fn();
    const _instance: IContainer<typeof Fn> = { callback, singleton };
    this.container.set(key, _instance);
  }
  public use<T>(namespace: string) {
    const item = this.container.get(namespace);
    if (item !== undefined) {
      //是单例模式 但是实例缺无人构建
      if (item.singleton && !item.instance) {
        item.instance = item.callback();
      }
      return item.singleton ? (item.instance as T) : (item.callback() as T);
    } else {
      throw new Error('没有找到Item');
    }
  }
  public restore(key: string) {
    this.container.delete(key);
  }
}

interface IUserService {
  test(str: string): void;
}

class UserService implements IUserService {
  constructor() {}

  public test(str: string): void {
    console.log('str', str);
  }
}

const ioc = new CreateIoc();
ioc.bind<IUserService>('userService', UserService);
const user = ioc.use<IUserService>('userService');
user.test('mack');
```




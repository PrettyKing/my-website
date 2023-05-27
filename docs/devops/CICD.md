---
title: 前端工程化之CI/CD
date: 2020-12-01
author: 卫辰
---


## 目标

- CI/CD概述
- 自动构建流程
- 版本控制
- 持续集成(CI) 持续交付和持续部署(CD) Jenkins与Travis

<!--truncate-->


### 概览图

![进程与线程](https://qiniu.faithcal.com/20201118-1.png)

### CI & CD

- 持续集成(CI)
- 持续交付和持续部署(CD)
- 现代软件开发的需求加上部署到不同基础设施的复杂性使得创建应用程序成为一个
  繁琐的过程。当应用程序出现规模性增长，开发团队人员变得更分散时，快速且不
  断地生产和发布软件的流程将会变得更加困难。
- 为了解决这些问题，开发团队开始探索新的策略来使他们的构建、测试和发布流程
  自动化，以帮助其更快地部署新的生产。这就是持续交付和持续集成发展的由来。

### CI/CD流程

![进程与线程](https://qiniu.faithcal.com/20201118-2.png)

### 自动构建

- 在软件开发过程中，构建流程会将开发人员生成的代码转换为可执行的可用软件。 
  - 对于Go或者C语言等编译语言，此阶段需要通过编译器运行源代码以生成独立的二进制文件。
  - 对于JavaScript或PHP等解释性语言，没有编译的步骤，但是代码依旧需要在特定的时间内冻结、绑定依 赖项、打包以便于分发。
  - 这些过程通常称为“构建”或“发布”的工件。 
- 虽然开发人员可以手动构建，但这样操作有诸多不利。
  -  首先，从主动开发到创建构建的转变中引入了上下文转换，使得开发人员不得不停止生产效率更高的工作来专注于构建过程。
  - 其次，每个开发人员都在制作自己的工件，这可能导致构建过程不一致。
- 为了解决这些顾虑，许多开发团队配置了自动构建流水线。这些系统监视源代码存储库，并在检测到更改时自动启动预配置的构建过程。这一配置无需牵涉过多的人力在其中并且确保了每个构建过程一致。

### 版本控制

- 版本控制系统(VCS)用于帮助维护项 目历史记录，并行处理离散特征，以及 解决存在冲突的更改。VCS允许项目轻 松采用更改并在出现问题时回滚。开发 人员可以在本地计算机上处理项目，并 使用VCS来管理不同的开发分支。
- 记录在VCS中的每个更改都称为提交。 每个提交都对代码库的更改进行编目分 类，元数据也包含在其中，例如关于查 看提交历史记录或合并更新的描述。

![进程与线程](https://qiniu.faithcal.com/20201118-3.png)

### 持续集成(CI)

- 持续集成(CI)是一个让开发人员将工作集 成到共享分支中的过程，从而增强了协作开 发。频繁的集成有助于解决隔离，减少每次 提交的大小，以降低合并冲突的可能性。
- 为了鼓励CI实践，一个强大的工具生态已经 构建起来。这些系统集成了VCS库，当检测 到更改时，可以自动运行构建脚本并且测试 套件。集成测试确保不同组件功能可以在一 个组内兼容，使得团队可以尽早发现兼容性 的bug。因此，持续集成所生产的构建是经 过充分测试的，并且是完全可靠的。

### 持续交付和持续部署

- 持续交付和持续部署是在构建持续集成的基础之上的两种策略。
- 持续交付 是持续集成的扩展，它将构建从集成测 试套件部署到预生产环境。这使得它可以直接在 类生产环境中评估每个构建，因此开发人员可以 在无需增加任何工作量的情况下，验证bug修复或 者测试新特性。一旦部署到staging环境中，就可 能需要进行额外的手动和自动测试。
- 持续部署 则更进一步。一旦构建在staging环境中 通过了自动测试，持续部署系统将会自动将它部 署到生产服务器上。换言之，每个通过测试的构 建都是实时的，可供用户及早反馈。这使得团队 可以不断发布新特性和修复bug，并以其测试流程 提供的保证为后盾。

### CI/CD的优势

- 快速反馈回路
- 增加可见度
- 简化故障排除
- 软件质量更高
- 集成问题更少
- 有更多的时间专注于开发

### CI/CD 集成

CI：防护层

CD : 持续交付

CD：持续部署

![进程与线程](https://qiniu.faithcal.com/20201118-4.png)

---

## 番外篇

###  sonarqube 环境集成

优点：

- 代码覆盖：通过单元测试，将会显示哪行代码被选中
- 改善编码规则
- 搜寻编码规则：按照名字，插件，激活级别和类别进行查询
- 项目搜寻：按照项目的名字进行查询
- 对比数据：比较同一张表中的任何测量的趋势

#### sonarqube相关地址

> [官网](https://www.sonarqube.org/ )
>
> [文档](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/ )
>
> [下载地址](https://www.oracle.com/cn/java/technologies/javase-downloads.html)
>
> [依赖数据库](https://www.oracle.com/index.html)
>
> [安装文档](https://docs.sonarqube.org/latest/setup/install-server/)

#### sonarqube 安装准备(Linux)

> 注意：sonarqube在7.9之后就不支持mysql了;jdk版本必须大于11

- sonarqube-8.5.1.38104.zip
- jdk-11.0.9_linux-x64_bin.tar.gz

#### 注意

Sonarqube 运行条件：必须是非 root 用户运行

```shell
# 使用sonar运行sonarqube

# 创建用户
adduser sonar
passwd sonar
# 给sonar设置权限（root）
chmod u+w sudoers
# vim sudoers 在root后面添加
sonar  ALL=(ALL)   ALL
# 复原权限
chmod u-w sudoers

```





#### 安装步骤

- 解压：

  ```shell
  unzip sonarqube-8.5.1.38104.zip
  ```

- 移动至安装目录：

  ```shell
  mv ./sonarqube-8.5.1.38104 /usr/local/
  ```

- 给sonarqube文件的sonar用户增加操作权限

  ```shell
  chown -R sonar:sonar sonarqube-8.5.1.38104
  ```

- 切换sonar用户

  ```shell
  #	切换用户
  su sonar
  ```

- 运行

  ```shell
  # 首次需要使用 console 参数启动， 可能的参数: start | stop | restart | status
  # sonarqube-8.5.1.38104/bin/linux-x86-64
  ./sonar.sh console
  # 第二次
  ./sonar.sh start
  
  ```

- 访问

  sonarqube的默认端口为：9000；地址：ip:9000(记得打开防火墙)

#### 其他

- sonarqube-8.5.1.38104文件目录

  ``` javascript
  // bin 目录文件
  .
  ├── jsw-license
  │   └── LICENSE.txt
  ├── linux-x86-64
  │   ├── lib
  │   │   └── libwrapper.so
  │   ├── SonarQube.pid
  │   ├── sonar.sh    //启动命令
  │   └── wrapper
  ├── macosx-universal-64
  │   ├── lib
  │   │   └── libwrapper.jnilib
  │   ├── sonar.sh
  │   └── wrapper
  └── windows-x86-64
      ├── lib
      │   └── wrapper.dll
      ├── StartNTService.bat
      ├── StartSonar.bat
      ├── StopNTService.bat
      └── wrapper.exe
  ```

  ```javascript
  .
  ├── sonar.properties
  └── wrapper.conf   //修改jdk的路径在此修改
  ```

  

- 修改jdk

  ```shell
  #wrapper.java.command=/path/to/my/jdk/bin/java
  wrapper.java.command=/usr/local/jdk-11.0.9/bin/java
  ```

#### SonarScanner mac安装

- 先使用 sonar 浏览器端创建项目

- 设置项目名称

- 配置token =》 继续

- 配置项目

- 下载SonarScanner包安装

  ```shell
  # vi ~/.bash_profile
  
  # export SCANNER_HOME="你下载的sonar-scanner地址"
  export SCANNER_HOME="/Users/hondry/opt/sonar-scanner"
  export PATH=$PATH:$SCANNER_HOME/bin
  
  # 使刚刚的配置环境生效
  source  ~/.bash_profile
  # 然后在 shell 中 校验是否安装完成
  sonar-scanner -v
  ```

- 本地项目配置

  ``` properties
  # 在项目根目录创建 sonar-project.properties
  # 复制刚刚创建项目的生成命令
  mvn sonar:sonar \
    -Dsonar.projectKey=Test \
    -Dsonar.host.url=http://8.129.231.174:9000 \
    -Dsonar.login=070990d7967e6038c5116053177ed78afd29b375
    
  # 在命令行执行
  sh ./sonar-project.properties
  # 等待执行完成了，就刷新sonar的网页就可以看到生成的报告了
  ```

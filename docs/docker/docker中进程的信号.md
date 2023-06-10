#### 一、进程的退出 - Linux

##### 1、kill 参数

| 1    | SIGHUP  | 启动被终止的程序，可让该进程重新读取自己的配置文件，类似重新启动。 |
| ---- | ------- | ------------------------------------------------------------ |
| 2    | SIGINT  | 相当于用键盘输入 [ctrl]-c 来中断一个程序的进行。             |
| 9    | SIGKILL | 代表强制中断一个程序的进行，如果该程序进行到一半，那么尚未完成的部分可能会有“半产品”产生，类似 vim会有 .filename.swp 保留下来。 |
| 15   | SIGTERM | 以正常的方式来终止该程序。由于是正常的终止，所以后续的动作会将他完成。不过，如果该程序已经发生问题，就是无法使用正常的方法终止时，输入这个 signal 也是没有用的。 |
| 19   | SIGSTOP | 相当于用键盘输入 [ctrl]-z 来暂停一个程序的进行。             |

##### 2、信号

信号是一种进程间通信的形式。一个信号就是内核发送给进程的一个消息，告诉进程发生了某种事件。当一个信号被发送给一个进程后，进程会立即中断当前的执行流并开始执行信号的处理程序。如果没有为这个信号指定处理程序，就执行默认的处理程序。
进程需要为自己感兴趣的信号注册处理程序，比如为了能让程序优雅的退出(接到退出的请求后能够对资源进行清理)一般程序都会处理 SIGTERM 信号。与 SIGTERM 信号不同，SIGKILL 信号会粗暴的结束一个进程。因此我们的应用应该实现这样的目录：捕获并处理 SIGTERM 信号，从而优雅的退出程序。如果我们失败了，用户就只能通过 SIGKILL 信号这一终极手段了。除了 SIGTERM 和 SIGKILL ，还有像 SIGUSR1 这样的专门支持用户自定义行为的信号



#### 二、容器中的信号

##### 1、容器中的进程属于容器的 1 号进程

Docker 的 stop 和 kill 命令都是用来向容器发送信号的。注意，只有容器中的 1 号进程能够收到信号，这一点非常关键！stop 命令会首先发送 SIGTERM 信号，并等待应用优雅的结束。如果发现应用没有结束(用户可以指定等待的时间)，就再发送一个 SIGKILL 信号强行结束程序。kill 命令默认发送的是 SIGKILL 信号，当然你可以通过 -s 选项指定任何信号

```js
'use strict';

var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3000, '0.0.0.0');

console.log('server started');

var signals = {
  'SIGINT': 2,
  'SIGTERM': 15
};

function shutdown(signal, value) {
  server.close(function () {
    console.log('server stopped by ' + signal);
    process.exit(128 + value);
  });
}

Object.keys(signals).forEach(function (signal) {
  process.on(signal, function () {
    shutdown(signal, signals[signal]);
  });
});
```

```json
{
  "name": "normalize.css",
  "version": "3.0.3",
  "description": "Normalize.css as a node packaged module",
  "style": "normalize.css",
  "files": [
    "LICENSE.md",
    "normalize.css"
  ],
  "homepage": "http://necolas.github.io/normalize.css",
  "repository": {
    "type": "git",
    "url": "git://github.com/necolas/normalize.css.git"
  },
  "main": "normalize.css",
  "author": {
    "name": "Nicolas Gallagher"
  },
  "license": "MIT",
  "gitHead": "2bdda84272650aedfb45d8abe11a6d177933a803",
  "bugs": {
    "url": "https://github.com/necolas/normalize.css/issues"
  },
  "_id": "normalize.css@3.0.3",
  "scripts": {},
  "_shasum": "acc00262e235a2caa91363a2e5e3bfa4f8ad05c6",
  "_from": "normalize.css@3.0.3",
  "_npmVersion": "2.7.0",
  "_nodeVersion": "0.10.35",
  "_npmUser": {
    "name": "necolas",
    "email": "nicolasgallagher@gmail.com"
  },
  "maintainers": [
    {
      "name": "tjholowaychuk",
      "email": "tj@vision-media.ca"
    },
    {
      "name": "necolas",
      "email": "nicolasgallagher@gmail.com"
    }
  ],
  "dist": {
    "shasum": "acc00262e235a2caa91363a2e5e3bfa4f8ad05c6",
    "tarball": "https://registry.npmjs.org/normalize.css/-/normalize.css-3.0.3.tgz"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/normalize.css/-/normalize.css-3.0.3.tgz",
  "readme": "ERROR: No README data found!"
}
```

```Dockerfile
FROM iojs:onbuild
COPY ./app.js ./app.js
COPY ./package.json ./package.json
EXPOSE 3000
ENTRYPOINT ["node", "app"]
```

```shell
$ docker build --no-cache -t signal-app -f Dockerfile .

$ docker run -it --rm -p 3000:3000 --name="my-app" signal-app

$ docker container kill --signal="SIGTERM" my-app
```



##### 2、容器中的进程不属于容器的 1 号进程

创建 app1.sh 文件

```shell
#!/bin/bash
node app 
```

创建 Dockerfile1 文件

```shell
FROM iojs:onbuild
COPY ./app.js ./app.js
COPY ./app1.sh ./app1.sh
COPY ./package.json ./package.json
RUN chmod +x ./app1.sh
EXPOSE 3000
ENTRYPOINT ["./app1.sh"]
```

```shell
$ docker build --no-cache -t signal-app1 -f Dockerfile1 .
$ docker run -it --rm -p 3000:3000 --name="my-app1" signal-app1
```



##### 3、在脚本中捕获信号

创建 app2.sh 文件

```shell
#!/bin/bash
# 打开调试级别
set -x

# 指定当前 pid 号
pid=0

# SIGUSR1-handler
my_handler() {
  echo "my_handler"
}


# SIGTERM-handler
term_handler() {
  if [ $pid -ne 0 ]; then
    kill -SIGTERM "$pid"
    # wait是用来阻塞当前进程的执行，直至指定的子进程执行结束后，才继续执行
    wait "$pid"
  fi
  exit 143; # 128 + 15 -- SIGTERM
}
# setup handlers
# on callback, kill the last background process, which is `tail -f /dev/null` and execute the specified handler

# 　trap 'commands' signal-list 当脚本收到 signal-list 清单内列出的信号时, trap 命令执行双引号中的命令
trap 'kill ${!}; my_handler' SIGUSR1
trap 'kill ${!}; term_handler' SIGTERM

# run application
node app &
pid="$!"

# wait forever
while true
do
  tail -f /dev/null & wait ${!}
done
```

创建 Dockerfile2 文件

```dockerfile
FROM iojs:onbuild
COPY ./app.js ./app.js
COPY ./app2.sh ./app2.sh
COPY ./package.json ./package.json
RUN chmod +x ./app2.sh
EXPOSE 3000
ENTRYPOINT ["./app2.sh"]
```

```shell
$ docker build --no-cache -t signal-app2 -f Dockerfile2 .
$ docker run -it --rm -p 3000:3000 --name="my-app2" signal-app2
```



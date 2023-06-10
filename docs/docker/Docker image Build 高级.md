#### 镜像 Cache 机制

**Docker Daemnon 通过 Dockerfile 构建镜像时，当发现即将新构建出的镜像与已有的某镜像重复时，可以选择放弃构建新的镜像，而是选用已有的镜像作为构建结果，也就是采取本地已经 cache 的镜像作为结果**



#### Cache 机制的注意事项：

**1. ADD 命令与 COPY 命令：Dockerfile 没有发生任何改变，但是命令`ADD run.sh /` 中 Dockerfile 当前目录下的 run.sh 却发生了变化，从而将直接导致镜像层文件系统内容的更新，原则上不应该再使用 cache。那么，判断 ADD 命令或者 COPY 命令后紧接的文件是否发生变化，则成为是否延用 cache 的重要依据。Docker 采取的策略是：获取 Dockerfile 下内容（包括文件的部分 inode 信息），计算出一个唯一的 hash 值，若 hash 值未发生变化，则可以认为文件内容没有发生变化，可以使用 cache 机制；反之亦然****

**2. RUN 命令存在外部依赖：一旦 RUN 命令存在外部依赖，如`RUN apt-get update`，那么随着时间的推移，基于同一个基础镜像，一年的 apt-get update 和一年后的 apt-get update， 由于软件源软件的更新，从而导致产生的镜像理论上应该不同。如果继续使用 cache 机制，将存在不满足用户需求的情况。Docker 一开始的设计既考虑了外部依赖的问题，用户可以使用参数 --no-cache 确保获取最新的外部依赖，命令为`docker build --no-cache -t="my_new_image" .`**

**3. 树状的镜像关系决定了，一次新镜像的成功构建将导致后续的 cache 机制全部失效：这一点很好理解，一旦产生一个新的镜像，同时意味着产生一个新的镜像 ID，而当前宿主机环境中肯定不会存在一个镜像，此镜像 ID 的父镜像 ID 是新产生镜像的ID。这也是为什么，书写 Dockerfile 时，应该将更多静态的安装、配置命令尽可能地放在 Dockerfile 的较前位置**



#### 传统 Build 流程

```dockerfile
FROM golang:1.7.3
WORKDIR /go/src/github.com/sparkdevo/href-counter/
RUN go get -d -v golang.org/x/net/html
COPY app.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```

```dockerfile
FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY app .
CMD ["./app"] 
```

```shell
#!/bin/sh
echo Building sparkdevo/href-counter:build
# 构建编译应用程序的镜像
docker build --no-cache -t sparkdevo/href-counter:build . -f Dockerfile.build
# 创建应用程序
docker create --name extract sparkdevo/href-counter:build
# 拷贝编译好的应用程序
docker cp extract:/go/src/github.com/sparkdevo/href-counter/app ./app
docker rm -f extract

echo Building sparkdevo/href-counter:latest
# 构建运行应用程序的镜像
docker build --no-cache -t sparkdevo/href-counter:latest .
```

![aa](https://s2.ax1x.com/2019/12/06/QJhERS.png)

```shell
# 下载使用的代码
$ git clone https://github.com/wangyanglinux/href-counter.git
```



#### Dockerfile 中 multi-stage

```dockerfile
FROM golang:1.7.3
WORKDIR /go/src/github.com/sparkdevo/href-counter/
RUN go get -d -v golang.org/x/net/html
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=0 /go/src/github.com/sparkdevo/href-counter/app .
CMD ["./app"]
```

**命名方式的 stage**

```dockerfile
FROM golang:1.7.3 as builder
WORKDIR /go/src/github.com/sparkdevo/href-counter/
RUN go get -d -v golang.org/x/net/html
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/sparkdevo/href-counter/app .
CMD ["./app"]
```



#### Google 内部精简镜像

```shell
$ git clone https://github.com/GoogleContainerTools/distroless
```



<!--旧版本的 docker 是不支持 multi-stage 的，只有 17.05 以及之后的版本才开始支持-->
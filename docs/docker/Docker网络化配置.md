[TOC]

#### 一、基础命令说明

```shell
# 查看当前可用的网络类型
$ docker network ls 	
# 网络空间名称
$ docker network create -d 类型 
	# 类型分为：
		# overlay network
		# bridge network
```



#### 二、独立至不同的网络命名空间进行隔离

```shell
$ docker network create -d bridge --subnet "172.26.0.0/16" --gateway "172.26.0.1" my-bridge-network

$ docker run -d --network=my-bridge-network --name test1  hub.c.163.com/public/centos:6.7-tools
	
$ docker run -d --name test2  hub.c.163.com/public/centos:6.7-tools
```



#### 三、使用 Linux 桥接器进行主机间的通讯

**脚本创建**

```shell
#!/bin/bash
ip addr del dev ens33 192.168.66.11/24
ip link add link ens33 dev br0 type macvlan mode bridge
ip addr add 192.168.10.6/24 dev br0
ip link set dev br0 up
ip route add default via 192.168.66.1 dev br0
```

**设置容器地址分配**

```shell
$ pipework br0 test 192.168.66.200/24@192.168.66.1
```



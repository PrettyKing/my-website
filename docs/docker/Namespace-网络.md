### Namespace - 网络

netns 是在 linux 中提供网络虚拟化的一个项目，使用 netns 网络空间虚拟化可以在本地虚拟化出多个网络环境，目前 netns 在 lxc 容器中被用来为容器提供网络

使用 netns 创建的网络空间独立于当前系统的网络空间，其中的网络设备以及 iptables 规则等都是独立的，就好像进入了另外一个网络一样 

```shell
# 创建虚拟网络空间
$ ip netns add r1

# 进入虚拟网络空间
$ ip netns exec r1 bash

# 添加一对 veth 设备
$ ip link add veth1.1 type veth peer name veth1.2

# 将其中一块网卡放入至 ns1 网络名称空间之中
$ ip link set veth1.1 netns r1

# 更改网络名称
$ ip link set veth1.1 name eth0

# 启动网卡
$ ip link set eth0 up

# 设置网卡名称
$ ip addr add 176.66.66.12/24 dev eth0

# 启动回环网卡
$ ip link set lo up
```

```shell
# 创建 bridge
$ ip link add name br0 type bridge
$ ip link set br0 up
$ ip addr add 176.66.66.1/24 dev br0

# 将设备连接至网桥
$ sudo ip link set dev veth1.2  master br0
```







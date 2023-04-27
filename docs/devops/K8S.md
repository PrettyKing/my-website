---
title: K8S 基础
date: 2021-05-18
tags:
 - K8S
categories:
 - 服务器环境
---

## 什么是K8S

- Kubernetes，因为首尾字母中间有8个字符，所以被简写成 K8s。
- K8s 是底层资源与容器间的一个抽象层，如果和单机架构类比，可以算 作是一个分布式时代的 Linux。
- K8s 是 Google 开源的容器集群管理系统。在 Docker 技术的基础上，为 容器化的应用提供部署运行、资源调度、服务发现和动态伸缩等一系列 完整功能，提高了大规模容器集群管理的便捷性。

### K8S的特点

- k8s是一个管理容器的工具，也是管理应用整个生命周期的一个工具， 从创建应用，应用的部署，应用提供服务，扩容缩容应用，应用更新， 而且可以做到故障自愈。
- 可移植:支持公有云，私有云，混合云;
- 可扩展:模块化，热插拨，可组合;
- 自愈:自动替换，自动重启，自动复制，自动扩展。

### K8S的管理步骤：

1. 创建集群
2. 部署应用
3. 发布应用
4. 扩展应用
5. 更新应用

### 基础架构

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-18-022757.png)

如上图，一般分为：

1. 生态系统
2. 接口层
3. 管理层
4. 应用层
5. 核心层

### 关于K8S的一些概念

- 主机(Master):用于控制 Kubernetes 节点的计算机。所有任务分配都来自于此。
- 节点(Node):执行请求和分配任务的计算机。由 Kubernetes 主机负责对节点进行控制。
- 容器集(Pod):部署在单个节点上的，且包含一个或多个容器的容器组。同一容器集中的所有容器共 享同一个 IP 地址、IPC、主机名称及其它资源。容器集会将网络和存储从底层容器中抽象出来。这样， 您就能更加轻松地在集群中移动容器。
- 复制控制器(Replication controller): 用于控制应在集群某处运行的完全相同的容器集副本数量。
- 服务(Service):服务可将工作定义与容器集分离。Kubernetes 服务代理会自动将服务请求分配到正 确的容器集——无论这个容器集会移到集群中的哪个位置，即使它已被替换。
- Kubelet: 这是一个在节点上运行的服务，可读取容器清单，确保指定的容器启动并运行。
- kubectl: Kubernetes 的命令行配置工具。

### 一张图

![](https://chalee-typora.oss-cn-beijing.aliyuncs.com/2021-05-18-023100.png)

### 安装K8S

（在Linux下安装单机版的集群环境：）以root身份执行以下操作：（详细步骤见第二部分）

1. 关闭防火墙

   ```shell
   # 关闭防火墙
   systemctl stop firewalld
   # 禁用防火墙
   systemctl disable firewalld
   ```

2. 安装Kubernetes和依赖组件etcd

   ```shell
   yum install -y etcd kubernetes
   ```

3. 修改配置：

   ```shell
   # Docker配置文件/etc/sysconfig/docker, 添加
   OPTIONS=‘-- selinux-enabled=false --insecure-registry gcr.io'
   # Kubernetes apiservce配置文件/etc/kubernetes/apiserver
   # 把--admission-control参数中的ServiceAccount删除
   ```

4. 启动服务

   ```shell
   # 按照顺序启动：
   systemctl start etcd
   systemctl start docker
   systemctl start kube-apiserver 
   systemctl start kube-controller-manager 
   systemctl start kube-scheduler 
   systemctl start kubelet
   systemctl start kube-proxy
   ```

### K8S的相关资源

1、官网 https://kubernetes.io

2、Chart 应用仓库 https://hub.kubeapps.com/

3、中文手册 https://www.kubernetes.org.cn/docs

## CentOS7(mini) 安装 Kubernetes 集群(**kubeadm**⽅式)

### 准备工作

1. 安装**net-tools**

   ```shell
   yum install -y net-tools
   ```

2. 关闭firewalld

   ```shell
   systemctl stop firewalld && systemctl disable firewalld
   setenforce 0
   sed -i 's/SELINUX=enforcing/SELINUX=disabled/g'
   ```

### 安装docker

> 如今Docker分为了了Docker-CE和Docker-EE两个版本，CE为社区版即免费版，EE为企业版即商业版。我们选择使⽤用CE版。

1. 安装yum源⼯工具包

   ```shell
   yum install -y yum-util sdevice-mapper-persistent-data lvm2
   ```

2. 下载docker-ce官⽅方的yum源配置⽂文件

   ```shell
   yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

3. 禁⽤用docker-c-edge源配edge是不不开发版，不不稳定，下载stable版

   ```shell
   yum-config-manager --disable docker-ce-edge
   ```

4. 更新本地YUM源缓存

   ```shell
    yum makecache fast
   ```

5. 安装Docker-ce相应版本的

   ```shell
   yum -y install docker-ce
   ```

6. 测试docker,运行个hello world

   ```
   systemctl start docker
   docker run hello-world
   ```

### 安装**kubelet**与**kubeadm**包

> 使⽤用kubeadm init命令初始化集群之下载Docker镜像到所有主机的实始化时会下载kubeadm必要 的依赖镜像，同时安装etcd,kube-dns,kube-proxy,由于我们GFW防⽕火墙问题我们不不能直接访问， 因此先通过其它⽅方法下载下⾯面列列表中的镜像，然后导⼊入到系统中，再使⽤用kubeadm init来初始化 集群。

1. 使⽤用DaoCloud加速器器(可以跳过这⼀步)

   ```shell
   [root@localhost ~]# curl -sSL
   https://get.daocloud.io/daotools/set_mirror.sh | sh -s
   http://0d236e3f.m.daocloud.io
   docker version >= 1.12
   {"registry-mirrors": ["http://0d236e3f.m.daocloud.io"]}
   Success.
   You need to restart docker to take effect: sudo systemctl restart docker
   [root@localhost ~]# systemctl restart docker
   ```

2. 下载镜像：通过Dockerfile到dockerhub⽣生成对镜像

   ```shell
   images=(kube-controller-manager-amd64 etcd-amd64 k8s-dns-sidecar-amd64
   kube-proxy-amd64 kube-apiserver-amd64 kube-scheduler-amd64 pause-amd64 k8s-
   dns-dnsmasq-nanny-amd64 k8s-dns-kube-dns-amd64)
   for imageName in ${images[@]} ; do
     docker pull champly/$imageName
     docker tag champly/$imageName gcr.io/google_containers/$imageName
     docker rmi champly/$imageName
   done
   ```

3. 修改版本：

   ```shell
   docker tag gcr.io/google_containers/etcd-amd64
   gcr.io/google_containers/etcd-amd64:3.0.17 && \
   docker rmi gcr.io/google_containers/etcd-amd64 && \
   docker tag gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64
   gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64:1.14.5 && \
   docker rmi gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64 && \
   docker tag gcr.io/google_containers/k8s-dns-kube-dns-amd64
   gcr.io/google_containers/k8s-dns-kube-dns-amd64:1.14.5 && \
   docker rmi gcr.io/google_containers/k8s-dns-kube-dns-amd64 && \
   docker tag gcr.io/google_containers/k8s-dns-sidecar-amd64
   gcr.io/google_containers/k8s-dns-sidecar-amd64:1.14.2 && \
   docker rmi gcr.io/google_containers/k8s-dns-sidecar-amd64 && \
   docker tag gcr.io/google_containers/kube-apiserver-amd64
   gcr.io/google_containers/kube-apiserver-amd64:v1.7.5 && \
   docker rmi gcr.io/google_containers/kube-apiserver-amd64 && \
   docker tag gcr.io/google_containers/kube-controller-manager-amd64
   gcr.io/google_containers/kube-controller-manager-amd64:v1.7.5 && \
   docker rmi gcr.io/google_containers/kube-controller-manager-amd64 && \
   docker tag gcr.io/google_containers/kube-proxy-amd64
   gcr.io/google_containers/kube-proxy-amd64:v1.6.0 && \
   docker rmi gcr.io/google_containers/kube-proxy-amd64 && \
   docker tag gcr.io/google_containers/kube-scheduler-amd64
   gcr.io/google_containers/kube-scheduler-amd64:v1.7.5 && \
   docker rmi gcr.io/google_containers/kube-scheduler-amd64 && \
   docker tag gcr.io/google_containers/pause-amd64
   gcr.io/google_containers/pause-amd64:3.0 && \
   docker rmi gcr.io/google_containers/pause-amd64
   ```

4. 添加阿⾥里里源

   ```shell
   [root@localhost ~]#  cat >> /etc/yum.repos.d/kubernetes.repo << EOF
   [kubernetes]
   name=Kubernetes
   baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-
   x86_64/
   enabled=1
   gpgcheck=0
   EOF
   ```

5. 查看kubectl kubelet kubeadm kubernetes-cni列列表

   ```shell
   yum list kubectl kubelet kubeadm kubernetes-cni
   ```

6. 安装kubectl kubelet kubeadm kubernetes-cni

   ```shell
   yum install -y kubectl kubelet kubeadm kubernetes-cni
   ```

7. 修改**cgroups**

   ```shell
   vi/etc/systemd/system/kubelet.service.d/10-kubeadm.conf
   
   ##update KUBELET_CGROUP_ARGS=--cgroup-driver=systemd to KUBELET_CGROUP_ARGS=-- cgroup-driver=cgroupfs
   ```

8. 修改**kubelet**中的**cAdvisor**监控的端⼝口，默认为**0**改为**4194**，这样就可以通过浏器器 查看**kubelet**的监控**cAdvisor**的**web**⻚

   ```shell
   vi /etc/systemd/system/kubelet.service.d/10- kubeadm.conf
   
   ## Environment="KUBELET_CADVISOR_ARGS=--cadvisor-port=4194"
   ```

9. 启动所有主机上的**kubelet**服务

   ```shell
   systemctl enable kubelet && systemctl start kubelet
   ```

10. 初始化**master master**节点上操作

    ```shell
    [root@master ~]# kubeadm reset && kubeadm init --apiserver-advertise-
    address=192.168.0.100 --kubernetes-version=v1.7.5 --pod-network-
    cidr=10.200.0.0/16
    [preflight] Running pre-flight checks
    [reset] Stopping the kubelet service
    [reset] Unmounting mounted directories in "/var/lib/kubelet"
    [reset] Removing kubernetes-managed containers
    [reset] Deleting contents of stateful directories: [/var/lib/kubelet
    /etc/cni/net.d /var/lib/dockershim /var/lib/etcd]
    [reset] Deleting contents of config directories:
    [/etc/kubernetes/manifests /etc/kubernetes/pki]
    [reset] Deleting files: [/etc/kubernetes/admin.conf
    /etc/kubernetes/kubelet.conf /etc/kubernetes/controller-manager.conf
    /etc/kubernetes/scheduler.conf]
    [kubeadm] WARNING: kubeadm is in beta, please do not use it for production
    clusters.
    [init] Using Kubernetes version: v1.7.5
    [init] Using Authorization modes: [Node RBAC]
    [preflight] Running pre-flight checks
    [preflight] WARNING: docker version is greater than the most recently
    validated version. Docker version: 17.09.0-ce. Max validated version: 1.12
    [preflight] Starting the kubelet service
    [kubeadm] WARNING: starting in 1.8, tokens expire after 24 hours by
    default (if you require a non-expiring token use --token-ttl 0)
    [certificates] Generated CA certificate and key.
    [certificates] Generated API server certificate and key.
    [certificates] API Server serving cert is signed for DNS names [master
    kubernetes kubernetes.default kubernetes.default.svc
    kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.0.100]
    [certificates] Generated API server kubelet client certificate and key.
    [certificates] Generated service account token signing key and public key.
    [certificates] Generated front-proxy CA certificate and key.
    [certificates] Generated front-proxy client certificate and key.
    [certificates] Valid certificates and keys now exist in
    "/etc/kubernetes/pki"
    [kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/admin.conf"
    [kubeconfig] Wrote KubeConfig file to disk: "/etc/kubernetes/kubelet.conf"
    [kubeconfig]WroteKubeConfigfiletodisk:"/etc/kubernetes/controller- manager.conf"
    [kubeconfig]WroteKubeConfigfiletodisk: "/etc/kubernetes/scheduler.conf"
    [apiclient]CreatedAPIclient,waitingforthecontrolplanetobecome ready
    [apiclient]Allcontrolplanecomponentsarehealthyafter34.002949 seconds
    [token]Usingtoken:0696ed.7cd261f787453bd9
    [apiconfig]CreatedRBACrules
    [addons]Appliedessentialaddon:kube-proxy
    [addons]Appliedessentialaddon:kube-dns
    
    YourKubernetesmasterhasinitializedsuccessfully!
    
    Tostartusingyourcluster,youneedtorun(asaregularuser): 38
    mkdir -p $HOME/.kube
    sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config
    
    Youshouldnowdeployapodnetworktothecluster.
    Run"kubectlapply-f[podnetwork].yaml"withoneoftheoptionslisted
    at:
    http://kubernetes.io/docs/admin/addons/
    Youcannowjoinanynumberofmachinesbyrunningthefollowingoneach
    node
    asroot:
    kubeadm join --token 0696ed.7cd261f787453bd9 192.168.0.100:6443 ##这个⼀一定要记住,以后 ⽆无法重现，添加节点需要
    ```

11. 添加节点

    ```shell
    kubeadm join --token 0696ed.7cd261f787453bd9 192.168.0.100:6443
    ```

12. 在**master**配置**kubectl**的**kubeconfig**⽂文件

    ```shell
    [root@master ~]# mkdir -p $HOME/.kube
    [root@master ~]# cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    [root@master ~]# chown $(id -u):$(id -g) $HOME/.kube/config
    ```

13. 在**Master**上安装flannel

    ```shell
    docker pull quay.io/coreos/flannel:v0.8.0-amd64
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.8.0/Documentation/kube-flannel.yml
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.8.0/Documentation/kube-flannel-rbac.yml
    ```

14. 查看集群

    ```shell
    kubectl get cs
    ```
### 查看系统版本
``` shell
##查看系统信息
cat /etc/os-release
##显示VERSION="8.6 (Ootpa)"
##查看内核版本。需大于3.10。8.6是4.18
uname -a
##显示4.18.0-372.19.1.el8_6.x86_64
```

### 设置使用阿里的repo源（没有RHEL的源，使用Centos源）
``` shell
wget -O /etc/yum.repos.d/redhat.repo http://mirrors.aliyun.com/repo/Centos-8.repo   #基础包
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/Centos-8.repo        #额外包
yum clean all        #清除缓存
yum makecache        #生成缓存
```

### 开启内核的流量转发
``` shell
cat <<EOF > /etc/sysctl.d/docker.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.all.rp_filter = 0
net.ipv4.ip_forward = 1
EOF
```

### 载内核参数
``` shell
sysctl -p /etc/sysctl.d/docker.conf
## 如果报错*/*/bridge-nf-call-ip6tables:No such file or directory 执行下面
#####  modprobe br_netfilter
```

### 查看仓库是否有docker
``` shell
yum list docker-ce --showduplicates | sort -r
## 如果没有
    ##第一种办法                    
    yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/rhel/docker-ce.repo
    ##第二种重新生成yum缓存办法
    curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.aliyun.com/docker-ce/linux/rhel/docker-ce
```

### 装docker
``` shell
##根据列表，安装20.10.9
yum install docker-ce-20.10.9 -y
```

### 生成docker配置文件daemon.json
``` shell
##创建目录以及文件
mkdir -p /etc/docker && touch /etc/docker/daemon.json
```

### 配置daemon.json
``` shell
## 使用阿里云镜像生成自己的加速镜像https://4efi3n2i.mirror.aliyuncs.com这个地址每个人生成的不一样
## 定义数据位置，docker根目录。默认是var/lib/docker
## 还配置了docker私服允许通过http方式推送镜像（私服服务器和客户机都要加这句）（例如：如果私服使用云服务器，这个地址就是云服务器的外网IP）
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://4efi3n2i.mirror.aliyuncs.com"],
  "data-root": "/file",
  "insecure_registries":["私服主机的IP:5000"]
}
EOF
```

### 重新载入和重启动
``` shell
##重新载入配置
systemctl daemon-reload
##重启docker
systemctl restart docker
##开启自启动docker
systemctl enable docker
#会弹出Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /usr/lib/systemd/system/docker.service.
```

### 查看docker状态
``` shell
ps -ef|grep docker
##弹出 
root       14595       1  0 16:14 ?        00:00:00 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
root       14760    9539  0 16:15 pts/0    00:00:00 grep --color=auto docker
```

### 卸载
``` shell
##新版本卸载
yum -y autoremove docker-ce docker-scan-plugin 
##老版本卸载 （ \）换行转义符
sudo yum -y remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine

##查看卸载完没有
rpm -qa |grep docker
```
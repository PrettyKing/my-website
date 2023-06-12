> 系统镜像：RedHatEnterpriseLinux [RHEL] 8
> Red Hat Enterprise Linux release 8.0 (Ootpa)

### 关闭防火墙
``` bash
# 查看防火墙状态
systemctl status nginx
# 停止防火墙
systemctl stop nginx
# 开机禁止启动
systemctl disable nginx
```

### 配置yum源
``` bash
# 把系统镜像挂载到/media/cdrom目录
mkdir -p /media/cdrom
mount /dev/cdrom /media/cdrom

vim /etc/yum.repos.d/rhel8.repo
[BaseOS]
name=BaseOS
baseurl=file:///media/cdrom/BaseOS
enabled=1
gpgcheck=0
[AppStream]
name=AppStream
baseurl=file:///media/cdrom/AppStream
enabled=1
gpgcheck=0
```

# my-website

> author : 卫辰

## CI


## 发布版本说明

博客地址：http://githubci.faithcal.com/

> 当我们提交代码为tag 是以'v'开头的时候才会触发自动部署到服务端 如 git push tag v0.1.0
- git add .
- git commit -m "feat: 第一次发布部署"
- git push(此时只是推送了提交记录，并不会触发自动化构建部署)
- git add .
- git tag v0.1.0(通过tag打版)
- git tag(查看版本)
- git push origin v0.1.0(把本地标签推送到远程仓库，会触发自动构建部署)

- jenkins test
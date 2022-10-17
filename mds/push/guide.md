---
title: 如何使用
nav:
  title: push命令用法
group:
  title: 如何使用
  path: /push
---

push 是用来自动打 tag 并且提交代码的， 为了简化一些繁琐的命令操作。

### 安装

1.项目内安装

```
npm install package-debug --save--dev
```

2.全局安装

```
npm install package-debug -g
```

### 使用

1.配置启动命令

```
"push": "package-debug push"
```

2.使用

```
npm run push
```

### 命令集合介绍

1.git pull 更新代码  
2.npm version patch --git-tag-version=false 更新 package.json 的 version 字段  
3.git add . 添加文件  
4.git commit -m '你输入的 message 值' 提交 commit  
5.git push 代码提交到远程  
6.执行 npm run build 开始打包代码  
7.npm publish --tag '你选的 tag' 发布 npm 包

到此，包已经发布好了，代码也都提交到了远程仓库。

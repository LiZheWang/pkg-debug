---
title: 介绍
nav:
  title: NPM包debug
group:
  title: 介绍
  path: /guide
---

package-debug 主要是监听目录，发现目录变动后，就将变动的文件同步到指定的目录（覆盖文件操作）。  
常用在 npm 包项目和业务项目的联调， 比如 npm 包项目打包后目录有变动， 就将变动的文件覆盖到 业务项目 node_modules 下面的包中。

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

1.在根目录新建配置文件 pkg-debug-config.js。[查看配置项](usage)

```javascript
module.exports = {
  // options
};
```

2.配置启动命令

```
"debug": "package-debug watch"
```

### 注意：

正常情况下，npm 包的项目都会有一个 npm run start 的命令， 用来本地开发，及时编译代码。  
所以一般先 npm run start 在另一个窗口中启动 npm run debug（监听输出的目录）

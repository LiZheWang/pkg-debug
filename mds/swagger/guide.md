---
title: 如何使用
nav:
  title: 图片压缩
group:
  title: 如何使用
  path: /compress
---

图片压缩是为了方便管理静态资源的项目，图片添加进来之后 执行命令，自动压缩 jpg 和 png 图片。

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
"compress": "package-debug compress"
```

2.使用

```
npm run compress
```

### 配置

1.在根目录新建配置文件 pkg-debug-config.js。

```javascript
module.exports = {
  compress: {
    sourcePath: '',
    jpgOps: {
      quality: 60,
    },
    pngOps: {
      quality: [0.9, 0.9],
    },
  },
};
```

<table>
  <thead>
    <tr>
      <th>属性名</th>
      <th>类型</th>
      <th>是否必选</th>
      <th>默认值</th>
      <th>介绍</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>sourcePath</td>
      <td>string | function</td>
      <td>true</td>
      <td>''</td>
      <td>
        1.字符串,一个正则匹配 pattern。如：'./!(node_modules)/**/*.*(png|jpg|jpeg)'  匹配除了node_modules的所有图片。 详细参考node glob模块<br/>
        2.function（返回一个数组，['1.jpg'])
      </td>
    </tr>
    <tr>
      <td>jpgOps</td>
      <td>number</td>
      <td>false</td>
      <td>60</td>
      <td>压缩率。 0-100的值</td>
    </tr>
    <tr>
      <td>pngOps</td>
      <td>array</td>
      <td>false</td>
      <td>[0.9,0.9]</td>
      <td>压缩率</td>
    </tr>

  </tbody>
</table>

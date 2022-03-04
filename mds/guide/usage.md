---
title: 基础使用
group:
  title: 基础使用
  path: /usage
---

### sources
sources 字段是必须的，需要配置 本地要监听的目录， 以及监听的目录变动后，要写入的目标目录。
```javascript
module.exports = {
  // 如果需要监听多个目录， 数组中配置多个项就好了  
  sources: []
}
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
      <td>distDirName</td>
      <td>string</td>
      <td>true</td>
      <td>''</td>
      <td>目标文件夹-相对路径（变动的文件会写入到这个文件夹下面），一般用在 npm包项目 和 业务项目同级的时候</td>
    </tr>
    <tr>
      <td>DistResolvePath</td>
      <td>string</td>
      <td>false</td>
      <td>''</td>
      <td>目标文件夹-绝对路径， 一般用在 npm包项目 和 业务项目 分别在不同的文件夹中</td>
    </tr>
    <tr>
      <td>localDir</td>
      <td>string</td>
      <td>true</td>
      <td>''</td>
      <td>本地需要监听的目录（基于根目录）</td>
    </tr>

  </tbody>
</table>

### on
运行时回调的钩子函数， 用于做一些自己的定制需求。
```javascript
module.exports = {
  on: {}
}
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
      <td>init</td>
      <td>function</td>
      <td>false</td>
      <td>''</td>
      <td>初始化的回调函数
<pre>
on: {
  init: function (rootPath, rootDirName, pathPrefix) {
    // rootPath: 项目根目录path路径
    // rootDirName: 根目录名字
    // pathPrefix: 路径的前缀
    // 可以在这里修改你需要的字段， 然后返回， 程序会按你返回的字段配置并执行代码。
    return {
      rootPath,
      rootDirName,
      pathPrefix
    }
  }
}
</pre>
      </td>
    </tr>
    <tr>
      <td>writeSuccess</td>
      <td>function</td>
      <td>false</td>
      <td>''</td>
      <td>监听到文件变动，并且写入成功的回调
<pre>
on: {
  writeSuccess: function (name, distFilePath) {
    // name: 变动的文件路径
    // distFilePath: 要写入的文件路径
  }
}
</pre>
</td>
    </tr>
    <tr>
      <td>writeError</td>
      <td>function</td>
      <td>false</td>
      <td>''</td>
      <td>监听到文件变动，并且写入失败的回调
<pre>
on: {
  writeError: function (e, name, distFilePath) {
    // e: 错误信息
    // name: 变动的文件路径
    // distFilePath: 要写入的文件路径
  }
}
</pre>
</td>
    </tr>

  </tbody>
</table>

### pkg-debug-config.js模板实例
<pre>
module.exports = {
    sources: [
        {
            distDirName: 'commerce-miniprogram',
            DistResolvePath: '',
            localDir: 'lib'
        }
    ],
    on: {
      init: function (rootPath, rootDirName, pathPrefix) {
      },
      
      writeSuccess: function (name, distFilePath) {
      },

      writeError: function (err, name, distFilePath) {
      },
    }
}

</pre>

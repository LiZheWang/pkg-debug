
package-debug是一个监听本地项目文件夹的变动， 并把变动的文件实时写入到目标文件夹的一个小工具。
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
}
```
2.配置启动命令
```
"debug": "package-debug watch"
```

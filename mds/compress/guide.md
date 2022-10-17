---
title: 如何使用
nav:
  title: swagger生成TS
group:
  title: 如何使用
  path: /compress
---

根据 swagger 文档，生成 TS 映射。

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
"swagger": "package-debug swagger"
```

2.使用

```
npm run swagger
```

### 配置

1.在根目录新建配置文件 pkg-debug-config.js。

```javascript
module.exports = {
  swagger: {
    swaggerUrl: '',
    baseDir: './src/api',
    importRequest: `import request from './request'`,
    tsNamespace: 'NEOAPI',
    replaceVal: function (type, enums) {
      if (type === 'integer') return 'number';
    },
    getSchemaTypeValue: function (schema) {},
  },
};
```

### getSchemaTypeValue 方法源码

```javascript
function getSchemaTypeValue(schema) {
  if (typeof config.getSchemaTypeValue === 'function') return config.getSchemaTypeValue(schema);
  if (schema.items) return getSchemaTypeValue(schema.items);
  if (schema.schema) return getSchemaTypeValue(schema.schema);
  if (schema.additionalProperties) return getSchemaTypeValue(schema.additionalProperties);
  if (schema.originalRef) return importDto(schema.originalRef);
  if (schema.type) return replaceVal(schema.type);
  console.log('没有值', schema);
  return null;
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
      <td>swaggerUrl</td>
      <td>string</td>
      <td>true</td>
      <td>''</td>
      <td>swagger文档地址，只支持swagger2.0</td>
    </tr>
    <tr>
      <td>baseDir</td>
      <td>string</td>
      <td>true</td>
      <td>'./api'</td>
      <td>TS生成的目录</td>
    </tr>
    <tr>
      <td>importRequest</td>
      <td>string</td>
      <td>true</td>
      <td>''</td>
      <td>import request from './request' ts生成的时候要引入请求方法，request对象需要有get和post方法。生成类似于：request.get('/xxx/xxx')</td>
    </tr>
    <tr>
      <td>tsNamespace</td>
      <td>string</td>
      <td>true</td>
      <td>'NEOAPI'</td>
      <td>TS的 namespace</td>
    </tr>
    <tr>
      <td>replaceVal</td>
      <td>fucntion</td>
      <td>false</td>
      <td></td>
      <td>
        用来纠正一些类型
      </td>
    </tr>
    <tr>
      <td>getSchemaTypeValue</td>
      <td>function</td>
      <td>false</td>
      <td></td>
      <td>处理 swagger的 Schema,一般不需要改。</td>
    </tr>

  </tbody>
</table>

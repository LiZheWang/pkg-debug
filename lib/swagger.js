const fetch = require('axios');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const uuid = require('node-uuid');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const ora = require('ora');

const loading = ora({
  text: '开始执行压缩任务，请稍后',
  color: 'gray',
});

module.exports = function () {
  let rootPath = process.cwd();
  let { swagger: config } = require(path.join(rootPath, 'pkg-debug-config'));

  const TAB = '\t'; // tab制表符
  const BR = '\n'; // 换行符
  const BRTAB = '\n\t'; // tab & br

  /*---------------参数配置  start------------------*/

  let configData = {};
  const swaggerUrl = config.swaggerUrl || 'http://business-api.dev.svc.retailcluster.local';
  const importRequest = config.importRequest || '';

  function getBaseDir() {
    let base = config.baseDir || './api';
    return base + `/${getGroup()}`;
  }

  function getDtoDir() {
    return `${getBaseDir()}/dto/index.d.ts`;
  }

  function getFnDir() {
    return `${getBaseDir()}/index.ts`;
  }

  function getNameSpace() {
    let nameSpace = config.tsNamespace || 'NEOAPI';
    return nameSpace + `_${getGroup()}`;
  }

  /*---------------参数配置  end------------------*/

  function setGroup(group) {
    try {
      configData.group = pinyin(group, { toneType: 'none' }).split(' ').join('');
    } catch (e) {
      console.log('设置group失败', e);
    }
  }

  function getGroup() {
    return configData.group || '';
  }

  function apiFetch(url) {
    return fetch
      .get(url)
      .then((res) => res.data)
      .catch((e) => {
        console.log('读取swagger地址失败', e);
      });
  }

  // map存储
  const mapCache = (function () {
    let map = new Map();
    return {
      get(key) {
        return map.get(key);
      },
      set(key, val) {
        return map.set(key, val);
      },
      delete(key) {
        map.delete(key);
      },
    };
  })();

  async function getRsources() {
    let res = await apiFetch(`${swaggerUrl}/swagger-resources`);
    let groups = res.map((item) => item.name);
    if (res && res.length) {
      let { group } = await inquirer.prompt([
        {
          type: 'list',
          message: '你要生成哪个平台的文档?',
          name: 'group',
          default: groups[0],
          choices: groups,
        },
      ]);
      loading.start(`开始生成文档，请稍后`);
      await getDocs(group);
    }
  }

  async function getDocs(group) {
    if (!group) {
      console.log('缺少必须的location参数');
      return;
    }
    setGroup(group);
    let docs = await apiFetch(`${swaggerUrl}/v2/api-docs?group=${encodeURI(group)}`);
    if (docs.info) {
      createDTO(docs.definitions);
      createAPi(docs.paths);
      loading.succeed(
        `成功成功，DTO：${Object.keys(docs.definitions).length}个；接口：${
          Object.keys(docs.paths).length
        }个。`,
      );
    }
  }

  function tabTxt(txt, count = 1) {
    return `${TAB.repeat(count)}${txt}${BR}`;
  }

  function getCommonFileTitle() {
    let txt = tabTxt('/*', 0);
    txt += tabTxt(
      `警告：该文件由脚本自动生成, 严禁手动修改！！！,如果需要更新API方法，执行 npm run swagger命令重新生成改文件`,
    );
    txt += tabTxt('*/', 0);
    return txt;
  }

  // 替换key 把中文等 不符合规范的 替换掉
  function replaceKey(key) {
    return getUid(key);
  }
  // 获取uid, 如果没有uid  就set进去
  function getUid(key) {
    let reg = /^[a-zA-Z0-9_]+$/gi;
    let uid = mapCache.get(key);
    if (uid) return uid;
    // 不符合规则？  转为uuid
    if (!reg.test(key)) {
      uid = 'auto_' + uuid().split('-').join('');
      mapCache.set(key, uid);
      return uid;
    }
    return key;
  }

  // 替换描述中的 空格符
  function replaceDescription(txt) {
    try {
      return txt.replace(/\n/g, '');
    } catch (e) {
      return txt;
    }
  }

  // 路径转驼峰
  function getApiName(url) {
    return url.replace(/[\/_-]([a-z])/g, function (str, $1) {
      return $1.toUpperCase();
    });
  }
  // 只接受 字母 数字  横线(-) 下换线(_)  斜线(/),  有其他的字符，一律不处理
  function pathValid(path) {
    return /^[\w\/-]+$/g.test(path);
  }

  // response 返回值 类型处理
  function getResponseType(responses) {
    try {
      let schema = responses['200'].schema;
      return getSchemaTypeValue(schema);
    } catch (e) {
      return null;
    }
  }

  function importDto(ref) {
    return `${getNameSpace()}.` + getUid(ref);
  }

  // 替换数据类型 integer 和 枚举这种数据的处理
  function replaceVal(type, enums = []) {
    if (typeof config.replaceVal === 'function') return config.replaceVal(type, enums);
    if (type === 'integer') return 'number';
    if (enums.length) {
      let res = '';
      prop.enum.forEach((em, index) => {
        res += `'${em}'${index !== prop.enum.length - 1 ? ' | ' : ''}`;
      });
      return res;
    }
    return type;
  }

  // 创建一个类型
  function createType(typeName, fn, tabCount = 0) {
    let txt = '';
    txt += tabTxt(`type ${typeName} = {`, tabCount);
    if (fn) txt += tabTxt(fn(txt), tabCount);
    txt += tabTxt(`}`, tabCount);
    return txt;
  }

  // 创建键值对 {key: value}
  function createKeyValue(key, schema, isRequired = false, tabCount = 2) {
    let txt = '';
    let description = `// ${replaceDescription(schema.description) || '缺少description'}`;
    txt += tabTxt(description, tabCount);
    txt += tabTxt(`${key}${isRequired ? '' : '?'}: ${getSchemaTypeValue(schema)};`, tabCount);
    return txt;
  }

  // 获取 schema 的 类型的 值， 关联了DTO就取 DTO的值， 没有关联 就取基础数据 类型
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

  // 类型是否 关联了 DTO ？
  function typeRelevanceDto(schema) {
    try {
      let type = getSchemaTypeValue(schema);
      return type.startsWith(getNameSpace());
    } catch (e) {
      return false;
    }
  }

  // 创建 request 参数的 type， 没有DTO映射的情况
  function createRequestType(parameters = [], parametersName) {
    try {
      return createType(parametersName, () => {
        let txt = '';
        parameters.forEach((item) => {
          let key = item.name;
          txt += createKeyValue(key, item, item.required);
        });
        return txt;
      });
    } catch (e) {
      return null;
    }
  }

  function getParametersDtoName(apiName, val) {
    let name = apiName + 'Parameters';

    // parameters 只有一个 且是引用类型  那就不在定义 dtoName
    if (val.parameters && val.parameters.length === 1) {
      let firstParam = val.parameters[0];
      if (firstParam.schema) {
        return tranSchema(firstParam.schema);
      }
    }

    return name;
  }

  function createDTO(definitions) {
    try {
      let txt = '';
      txt += getCommonFileTitle();
      txt += `declare namespace ${getNameSpace()} { ${BR}`;

      for (const key in definitions) {
        let val = definitions[key];
        // if (key === 'AccessDto') {
        // 外层对象声明
        let title = `// ${val.title}---${key}`;
        txt += tabTxt(title);

        txt += createType(
          replaceKey(key),
          () => {
            //  具体的属性值声明
            let txt = '';

            for (const propKey in val.properties) {
              let propVal = val.properties[propKey];
              txt += createKeyValue(propKey, propVal, false, 2);
            }
            return txt;
          },
          1,
        );
        // }
      }

      txt += `}`;
      fs.outputFileSync(getDtoDir(), txt);
    } catch (e) {
      console.error('生成DTO失败', e);
    }
  }

  function createAPi(paths) {
    try {
      let txt = '';
      txt += getCommonFileTitle();
      txt += tabTxt(`${importRequest}`, 0);
      for (let path in paths) {
        // 无效的不处理
        if (!pathValid(path)) continue;

        let valObj = paths[path];
        let apiMethod = Object.keys(valObj)[0];
        let val = valObj[apiMethod];

        let title = tabTxt(`// ${val.summary}---${val.consumes}`, 0);
        txt += title;

        let apiName = getApiName(path);
        let requestParamsType = 'any';

        // parameters 只有一个 且是引用类型  就不生成 paramType， 参数也直接定义成 DTO的引用
        if (val.parameters && val.parameters.length === 1) {
          let firstSchema = val.parameters[0];
          let isDtoType = typeRelevanceDto(firstSchema);
          if (isDtoType) {
            requestParamsType = getSchemaTypeValue(firstSchema);
          } else {
            requestParamsType = apiName + 'Parameters';
            // 不是引用DTO的话  就创建一个 参数类型
            txt += createRequestType(val.parameters || [], requestParamsType);
          }
        }

        txt += tabTxt(`export const ${apiName} = (data: ${requestParamsType}) => {`, 0);
        txt += tabTxt(
          `return request.${apiMethod}('${path}', data) as Promise<${getResponseType(
            val.responses,
          )}>`,
        );
        txt += tabTxt(`}`, 0);
      }

      fs.outputFileSync(getFnDir(), txt);
    } catch (e) {
      console.error('生成API失败', e);
    }
  }

  function init() {
    getRsources();
  }

  init();
};

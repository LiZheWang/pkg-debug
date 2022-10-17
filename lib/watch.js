const watch = require('node-watch');
const path = require('path');
const chalk = require('chalk');
const package = require(path.join(process.cwd(), 'package.json'));
const fse = require('fs-extra');
const fs = require('fs');

module.exports = function () {
  let rootPath = process.cwd();
  let rootDirName = path.basename(rootPath);
  let pathPrefix = path.dirname(rootPath);
  let config = {};
  try {
    config = require(path.join(rootPath, 'pkg-debug-config'));
  } catch (e) {}
  let { sources, on = {} } = config;

  // init 回调
  if (typeof on.init === 'function') {
    let initParams = on.init(rootPath, rootDirName, pathPrefix);
    if (initParams) {
      if (initParams.rootPath) rootPath = initParams.rootPath;
      if (initParams.rootDirName) rootPath = initParams.rootDirName;
      if (initParams.pathPrefix) rootPath = initParams.pathPrefix;
    }
  }

  if (sources && sources.length) {
    for (const source of sources) {
      let distDir = path.join(pathPrefix, source.distDirName);
      if (source.DistResolvePath) {
        distDir = source.DistResolvePath;
      }
      let distDirIsExists = fs.existsSync(distDir);
      if (!distDirIsExists) {
        console.log(chalk.red(`${source.distDirName}目录不存在,path：${distDir}`));
        continue;
      }
      let distPackageDir = path.join(distDir, 'node_modules', package.name);
      if (!fs.existsSync(distPackageDir)) {
        if (source.distPathCover) {
          console.log(`${distPackageDir}目录不存在，程序自动创建了`);
          fse.ensureDirSync(distPackageDir);
        } else {
          console.log(
            chalk.red(
              `${source.distDirName}项目node_modules下${package.name}目录不存在,path：${distPackageDir}`,
            ),
          );
          continue;
        }
      }

      let localDir = path.join(rootPath, source.localDir);
      if (!fs.existsSync(localDir)) {
        console.log(chalk.red(`${rootDirName}项目下不存在${source.localDir}目录,path:${localDir}`));
        continue;
      }

      watch(localDir, { recursive: true }, function (evt, name) {
        let relativeName = name.replace(rootPath, '');
        let distFilePath = path.join(distPackageDir, relativeName);
        try {
          fse.copySync(name, distFilePath);
          // 写入 成功
          if (typeof on.writeSuccess === 'function') {
            on.writeSuccess(name, distFilePath);
          }
        } catch (e) {
          // 写入 失败
          if (typeof on.writeError === 'function') {
            on.writeError(e, name, distFilePath);
          }
        }
      });
    }
  } else {
    console.log(
      chalk.red('debug包提示：根目录必须要有pkg-debug-config.js配置文件，并且配置sources字段'),
    );
    console.log(chalk.yellow('更多配置，请查看文档：https://lizhewang.github.io/pkg-debug'));
  }
};

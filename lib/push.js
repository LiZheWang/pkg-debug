const inquirer = require('inquirer');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');

function getVersion() {
  const package = require(path.join(process.cwd(), 'package.json'));
  return `v${package.version}`;
}

function getBranch() {
  try {
    return shell.exec('git branch | grep "*"').stdout.replace('*', '').trim();
  } catch (e) {
    console.log('获取分支失败', e);
  }
  return '';
}

async function run() {
  let rootPath = process.cwd();
  config = require(path.join(rootPath, 'pkg-debug-config'));
  const envs = config.envs || ['none', 'dev', 'sit', 'uat', 'prod'];
  let buildCommand = `${config.build ? config.build : 'npm run build'}`;
  try {
    let { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '请选择tag标签',
        default: envs[0],
        choices: envs,
      },
    ]);

    let { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '请输入git commit的message信息:',
      },
    ]);
    if (!message) {
      console.log('请输入commit信息');
      return false;
    }

    if (type === 'none') type = '';

    // 提交代码
    shell.exec('git pull');
    shell.exec(`npm version patch --git-tag-version=false`);
    message = `分支：[${getBranch()}]tag：[${type}] - ${message}`;
    shell.exec('git add .');
    let commit = shell.exec(`git commit -m "${message}"`);
    chalk.green(`准备push代码：${getVersion()}`);
    shell.exec(`git push`);
    chalk.green(`准备publish包：${getVersion()}`);
    shell.exec(buildCommand);
    if (type) {
      shell.exec(`npm publish --tag ${type}`);
    } else {
      shell.exec(`npm publish`);
    }

    chalk.green(`发布完成：${getVersion()}`);
  } catch (e) {
    console.error('push失败了', e);
  }
}

module.exports = function () {
  return run();
};

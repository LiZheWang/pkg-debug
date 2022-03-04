#!/usr/bin/env node

const program = require('commander'); // 命令行工具
const chalk = require('chalk'); // 命令行输出美化

program
  .version(require('../package').version, '-v, --version') // 版本
  .usage('<command> [options]'); // 使用信息


// 监听debug
program
  .command('watch')
  .description('开启监听，会将本地包的文件直接写入distDirName目录下面')
  .action((cmd) => {
    require('../lib/watch.js')();
  });

// 处理非法命令
program.arguments('<command>').action(cmd => {
  // 不退出输出帮助信息
  console.log(chalk.yellow(`没有命令:${cmd}`));
});

program.parse(process.argv);


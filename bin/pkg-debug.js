#!/usr/bin/env node

const program = require('commander'); // 命令行工具
const chalk = require('chalk'); // 命令行输出美化

program
  .version(require('../package').version, '-v, --version') // 版本
  .usage('<command> [options]'); // 使用信息

// 监听 debug
program
  .command('watch')
  .description('开启监听，会将本地包的文件直接写入distDirName目录下面')
  .action((cmd) => {
    require('../lib/watch.js')();
  });

// 监听 push
program
  .command('push')
  .description('自动发布版本，省心操作')
  .action((cmd) => {
    require('../lib/push.js')();
  });

// 监听 compress
program
  .command('compress')
  .description('压缩图片命令')
  .option('--diff', '只处理新增的文件')
  .action((cmd) => {
    require('../lib/compress.js')();
  });

// 监听 swagger
program
  .command('swagger')
  .description('根据swagger文档生成TS映射')
  .action((cmd) => {
    require('../lib/swagger.js')();
  });

// 处理非法命令
program.arguments('<command>').action((cmd) => {
  // 不退出输出帮助信息
  console.log(chalk.yellow(`没有命令:${cmd}`));
});

program.parse(process.argv);

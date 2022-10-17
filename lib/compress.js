const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');
const glob = require('glob');
const ora = require('ora');

const loading = ora({
  text: '开始执行压缩任务，请稍后',
  color: 'gray',
});

const compressRun = async (filePath) => {
  try {
    const config = require(path.join(process.cwd(), 'pkg-debug-config'));
    let { jpgOps = {}, pngOps = {} } = config;
    let jpgOptions = Object.assign(
      {
        quality: 60,
      },
      jpgOps,
    );
    let pngOptions = Object.assign(
      {
        quality: [0.9, 0.9],
      },
      pngOps,
    );
    let dirname = path.dirname(filePath);
    await imagemin([filePath], {
      destination: dirname,
      plugins: [imageminMozjpeg(jpgOptions), imageminPngquant(pngOptions)],
    });
  } catch (e) {
    console.log('压缩处理失败', e);
  }
};

function run() {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(path.join(process.cwd(), 'pkg-debug-config'));
      let { compress } = config;
      // 待压缩的图片所在的文件夹
      // const p = './!(node_modules)/**/*.*(png|jpg|jpeg)';

      let files;
      if (typeof compress.sourcePath === 'function') {
        files = compress.sourcePath();
      } else {
        const sourcePath = path.resolve(process.cwd(), compress.sourcePath);
        files = glob.sync(sourcePath);
      }

      let len = files.length;
      loading.start(`开始压缩，一共${len}个文件,请稍后...`);
      if (len) {
        for (let i = 0; i < len; i++) {
          let file = files[i];
          await compressRun(file);
        }
        resolve(true);
        loading.succeed('压缩成功');
      } else {
        resolve(false);
      }
    } catch (e) {
      console.log('压缩脚本执行失败');
      reject();
    }
  });
}

module.exports = function () {
  return run();
};

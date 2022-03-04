import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'package-debug',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs',
  base: '/pkg-debug',
  publicPath: '/pkg-debug/',
  mode: 'site',
  resolve: {
    includes: ['mds', 'src'],
  },
  // more config: https://d.umijs.org/config
  navs: [
    null, // null 值代表保留约定式生成的导航，只做增量配置
    {
      title: 'GitHub',
      path: 'https://github.com/LiZheWang/pkg-debug',
    },
  ],
});

import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'

export default defineConfig<'webpack5'>(async (merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'mini-shop',
    date: '2024-1-1',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
      375: 2 / 1,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.alias
          .set('@', require('path').resolve(__dirname, '..', 'src'))
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      esnextModules: ['taro-ui'],
      postcss: {
        autoprefixer: {
          enable: true,
        },
        pxtransform: {
          enable: true,
          config: {},
        },
      },
      webpackChain(chain) {
        chain.resolve.alias
          .set('@', require('path').resolve(__dirname, '..', 'src'))
      },
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig)
})

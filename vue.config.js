module.exports = {
  devServer: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://172.24.6.81:8888',
        changeOrigin: true,
        ws: true,
      },
    },
    hot: true,
    open: true,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  publicPath: process.env.NODE_ENV === 'production' ? '//' : '/',
  productionSourceMap: false,
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      sass: {
        // @/ 是 src/ 的别名
        data: '@import "@/style/variables.scss";',
      },
    },
  },
};

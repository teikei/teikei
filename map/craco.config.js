module.exports = ({ env }) => {
  if (env === 'production') {
    return {
      plugins: [
        {
          plugin: {
            overrideWebpackConfig: ({ webpackConfig }) => {
              // disable CRA 2 code splitting until we update the
              // gatsby integration to support this

              // eslint-disable-next-line no-param-reassign
              webpackConfig.optimization.splitChunks = {
                // chunks: 'all',
                // name: false,
                cacheGroups: {
                  default: false,
                },
              }
              // eslint-disable-next-line no-param-reassign
              webpackConfig.optimization.runtimeChunk = false
              return webpackConfig
            },
          },
          options: {},
        },
      ],
    }
  }
  return {}
}

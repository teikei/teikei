const env = require('node-env-file')

env('../.env')

module.exports = {
  type: 'react-app',
  babel: {
    stage: 0
  },
  webpack: {
    extra: {
      info: true,
      entry: {
        index: './src/index',
        map: './src/map'
      },
      output: {
        filename: "[name].js"
      },
      externals: {
        'jquery': 'jQuery',
        '$': 'jQuery'
      }
    },
    define: {
      'process.env': Object.keys(process.env).reduce(function (o, k) {
        o[k] = JSON.stringify(process.env[k])
        return o
      }, {})
    }
  }
}

var env = require('node-env-file')
env('.env')

module.exports = {
  type: 'react-app',
  babel: {
    stage: 0,
    optional: ['runtime']
  },
  webpack: {
    define: {
      'process.env': Object.keys(process.env).reduce(function (o, k) {
        o[k] = JSON.stringify(process.env[k])
        return o
      }, {})
    },
    externals: {
      'jquery': 'jQuery'
    }
  }
}

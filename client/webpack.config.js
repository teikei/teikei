var webpack = require('webpack');

var env = require('node-env-file');
env('../.env');


var config = {
  context: __dirname,
  entry: ["./src/index"
  ],
  output: {
    filename: "client_bundle.js",
    path: "../app/assets/javascripts"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': Object.keys(process.env).reduce(function(o, k) {
        o[k] = JSON.stringify(process.env[k]);
        return o;
      }, {})
    })
  ]
};

module.exports = config;

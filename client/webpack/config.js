var webpack = require('webpack');
var path = require('path');
var env = require('node-env-file');

var rootPath = path.resolve('.');

function appPath(relativePath) {
  return path.join(rootPath, relativePath);
}

env('.env');

var config = {
  cache: true,
  debug: true,
  entry: [
    appPath('/client/src/index')
  ],
  output: {
    filename: "client_bundle.js",
    path: appPath('/app/assets/javascripts'),
    publicPath: 'http://localhost:8888/assets/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': Object.keys(process.env).reduce(function(o, k) {
        o[k] = JSON.stringify(process.env[k]);
        return o;
      }, {})
    })
  ],
  externals: {
    "jquery": "jQuery"
  }
};

module.exports = config;

var webpack = require('webpack');
var path = require('path');
var env = require('node-env-file');

var rootPath = path.resolve('.');

function appPath(relativePath) {
  return path.join(rootPath, relativePath);
}

env('.env');

var definePlugin = new webpack.DefinePlugin({
  'process.env': Object.keys(process.env).reduce(function(o, k) {
    o[k] = JSON.stringify(process.env[k]);
    return o;
  }, {})
});
var uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  compress: {
    screw_ie8: true,
    warnings: false
  }
});
var occurenceOrderPlugin = new webpack.optimize.OccurenceOrderPlugin(true);
var dedupePlugin = new webpack.optimize.DedupePlugin();

function config(devMode) {
  return {
    cache: devMode,
    debug: devMode,
    entry: [
      appPath('/client/src/index')
    ],
    output: devMode ? {
      filename: 'client_bundle.js',
      path: appPath('/app/assets/javascripts'),
      publicPath: 'http://localhost:8888/assets/'
    } : {
      filename: 'client_bundle.js',
      path: appPath('/app/assets/javascripts')
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
    plugins: devMode ? [
      definePlugin,
      occurenceOrderPlugin
    ] : [
      definePlugin,
      occurenceOrderPlugin,
      uglifyPlugin,
      dedupePlugin
    ],
    externals: {
      'jquery': 'jQuery'
    }
  };
}
module.exports = config;

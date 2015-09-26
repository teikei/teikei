var webpack = require('webpack');
var DevServer = require('webpack-dev-server');

var webpackConfig = require('./config');

var serverConfig = {
  contentBase: 'http://localhost:8888',
  publicPath: 'http://localhost:8888/assets/',
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true,
    version: false,
    hash: false,
    chunks: false,
    chunkModules: false
  }
};

var compiler = webpack(webpackConfig);

module.exports = function run(callback) {
  new DevServer(compiler, serverConfig).listen(8888, 'localhost', callback());
};

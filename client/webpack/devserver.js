var webpack = require('webpack');
var DevServer = require('webpack-dev-server');
var webpackStatsConfig = require('./stats');
var webpackConfig = require('./config')(true);

var serverConfig = {
  contentBase: 'http://localhost:8888',
  publicPath: 'http://localhost:8888/assets/',
  hot: true,
  historyApiFallback: true,
  stats: webpackStatsConfig
};

var compiler = webpack(webpackConfig);

module.exports = function(callback) {
  new DevServer(compiler, serverConfig).listen(8888, 'localhost', callback());
};

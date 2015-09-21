var gulp = require('gulp');
var gutil = require('gutil');
var shell = require('gulp-shell');
var path = require('path');
var eslint = require('gulp-eslint');
var webpack = require('webpack');
var env = require('node-env-file');
var WebpackDevServer = require('webpack-dev-server');

env('.env');

var webpackDevConfig = {
  cache: true,
  debug: true,
  context: __dirname,
  entry: [
    "./client/src/index"
  ],
  output: {
    filename: "client_bundle.js",
    path: path.join(path.resolve('.'), '/app/assets/javascripts'),
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
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

var webpackDevServerConfig = {
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

gulp.task('webpack-devserver', function(callback) {
  new WebpackDevServer(webpack(webpackDevConfig), webpackDevServerConfig).listen(8888, 'localhost', function(err, result) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
    gutil.log('[webpack-dev-server]', result);
    callback();
  });
});

gulp.task('rails-server', shell.task([
  'bundle exec spring rails s'
]));

gulp.task('lint', function() {
  return gulp.src([
    './client/src/**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('default', ['webpack-devserver', 'rails-server']);

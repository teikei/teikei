var gulp = require('gulp');
var gutil = require('gutil');
var shell = require('gulp-shell');
var path = require('path');
var eslint = require('gulp-eslint');
var webpack = require('webpack');

var webpackDevServer = require('./client/webpack/devserver');

var webpackProdConfig = require('./client/webpack/config')(false);


gulp.task('webpack-devserver', function() {
  webpackDevServer(function(err, success) {
    if (err) {
      throw new gutil.PluginError('[webpack-dev-server]', err);
    }
    gutil.log("[webpack-dev-server]", success);
  });
});

gulp.task('webpack-production-build', function(callback) {
  webpack(webpackProdConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }
    gutil.log("[webpack]", stats);
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

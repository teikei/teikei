var gulp = require('gulp');
var gutil = require('gutil');
var shell = require('gulp-shell');
var path = require('path');
var eslint = require('gulp-eslint');

var webpack = require('webpack');
var webpackDevServer = require('./client/webpack/devserver');
var webpackProdConfig = require('./client/webpack/config')(false);
var webpackStatsConfig = require('./client/webpack/stats');

gulp.task('webpack-devserver', function(callback) {
  webpackDevServer(function(err) {
    if (err) {
      throw new gutil.PluginError('webpack-devserver', err);
    }
    callback();
  });
});

gulp.task('webpack-production-build', function(callback) {
  webpack(webpackProdConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack-production-build', err);
    }
    gutil.log('webpack-production-build', stats.toString(webpackStatsConfig));
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

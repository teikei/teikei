var gulp = require('gulp');
var gutil = require('gutil');
var shell = require('gulp-shell');
var path = require('path');
var eslint = require('gulp-eslint');
var webpack = require('webpack');

var webpackDevServer = require('./client/webpack/devserver');


gulp.task('webpack-devserver', function() {
  webpackDevServer(function(err, success) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
    gutil.log(success);
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

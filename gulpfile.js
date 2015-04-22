var gulp = require('gulp');
var shell = require('gulp-shell');
var tinylr = require('tiny-lr');
var bower = require('gulp-bower');

gulp.task('bower', function() {
  return bower();
});

gulp.task('server', shell.task([
  'bundle exec spring rails s'
]));

var liveReloadServer = tinylr();
gulp.task('livereload', function() {
  liveReloadServer.listen(35729);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);
  liveReloadServer.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', function() {
  gulp.watch('./app/assets/**/*', notifyLiveReload);
});


gulp.task('default', ['bower', 'livereload', 'server', 'watch']);
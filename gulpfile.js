const gulp = require('gulp');
const babel = require('gulp-babel');

const files = {
  sources: [
    'src/**/*.js'
  ]
};

gulp.task('build', () => {
  return gulp.src(files.sources)
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('default', () => {
  gulp.start('build');
});

gulp.task('watch', () => {
  gulp.watch(files.sources, ['build']);
});
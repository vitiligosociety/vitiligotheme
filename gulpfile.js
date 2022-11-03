// Put this file in .npm in theme dir gulpfile.js
var gulp = require('gulp');
var es2015 = require('babel-preset-env');
var sass = require('gulp-sass')(require('sass'));
var babel = require('gulp-babel');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var replace = require('gulp-replace');
const del = require('del');

gulp.task('compileJs', gulp.series(function() {

  // Delete all js from output dir (leave subdirs)
  del(['./js/*.js', './js/*.js.map'], { force:1 });

  return gulp.src('./js-src/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(replace(/('|")use strict\1/g, ';'))
  //.pipe(concat('all.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./js'));
}));
gulp.task('compileCss', gulp.series(function() {
  return gulp.src('./sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([ autoprefixer() ]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./css'));
}));
gulp.task('watch', gulp.series(function () {
  gulp.watch(['./sass/**/*.scss', './js-src/**/*.js'], gulp.series('default'));
}));
gulp.task('default', gulp.parallel('compileCss', 'compileJs'));

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var removeHtmlComments = require('gulp-remove-html-comments');
var imagemin = require('gulp-imagemin');

var paths = {
  js: 'src/js/*.js',
  css: 'src/css/*.css',
  html: 'src/*.html',
  php: 'src/api/*.php',
  data: 'src/data/*.txt',
  images: 'src/images/*/*',
}

gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(removeHtmlComments())
    .pipe(gulp.dest('dist/'))
});

gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('data', function() {
  return gulp.src(paths.data)
    .pipe(gulp.dest('dist/data'))
});

gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))
});

gulp.task('php', function() {
  return gulp.src(paths.php)
    .pipe(gulp.dest('dist/api'))
});



gulp.task('build', ['html', 'js', 'css', 'php', 'images', 'data'], function(){
  console.log("Build completed");
});
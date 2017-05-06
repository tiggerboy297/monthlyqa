import gulp from 'gulp';
import gulploadplugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import yargs from 'yargs';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import handlebars from 'browserify-handlebars';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import pkgInfo from './package.json';

const $ = gulploadplugins({
  lazy: true
});

const argv = yargs.argv;

// SASS Styles
gulp.task('styles', () => {
  return gulp.src([
    'src/vendor/**/*.css',
    'src/sass/*.scss'
  ])
    .pipe($.changed('.tmp/styles', {extension: '.css'}))
    .pipe($.if(!argv.production,$.sourcemaps.init()))
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: ['last 10 version'] }))
    .pipe(gulp.dest('.tmp'))
    // Concatenate and minify styles if production mode (via gulp styles --production)
    .pipe($.if('*.css' && argv.production, $.minifyCss()))
    .pipe($.if(!argv.production,$.sourcemaps.write()))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream())
    .pipe($.size({title: 'styles'}));
});

// Scripts - app.js is the main entry point, you have to import all required files and modules
gulp.task("scripts", () => {
  return browserify({
    entries: 'src/js/app.js',
    debug: true
  })
  .transform("babelify", {presets: ["es2015"]})
  .transform(handlebars)
  .bundle()
  .pipe(source("app.js"))
  .pipe(buffer())
  .pipe($.if(!argv.production,$.sourcemaps.init({loadMaps: true})))
  .pipe($.if(argv.production,$.uglify()))
    .on('error', $.util.log)
  .pipe($.if(!argv.production,$.sourcemaps.write()))
  .pipe(gulp.dest("./public/js"));
});

// Browser-Sync
gulp.task('serve', ['styles', 'scripts'], () => {
  browserSync({
    notify: false,
    logPrefix: 'CEO SUMMIT',
    server: ['.tmp', 'public'],
    port: 3003
  });

  gulp.watch(['public/**/*.html'], browserSync.reload);
  gulp.watch(['src/sass/**/*.{scss,css}'], ['styles']);
  gulp.watch(['src/js/**/*.js', 'src/templates/**/*.handlebars'], ['scripts', browserSync.reload]);
});

// Browser-Sync
gulp.task('build', ['styles', 'scripts'], () => {
  console.log('Build Complete.')
});

var gulp = require('gulp');
var gulpLog = require('gulp-log'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    gulpMd5 = require('gulp-md5')(8),
    gutil = require('gulp-util')
    ;
var browserSync = require('browser-sync').create();
var path = require('path');
var reload      = browserSync.reload;
console.log('dirname',__dirname)
//静态服务器 +监听 scss/html
gulp.task('server',function(){
    browserSync.init({
        server:{
            baseDir: path.resolve(__dirname,"../src")
        }
    });
    gulp.watch([
        "src/assets/less/**/*.less"
    ], ['bs:build']);
});

gulp.task('bs:build',function(){
    var stream = gulp.src(
        [
            'src/assets/less/**/*.less',
            '!src/assets/less/**/_*.less',
            '!src/assets/less/**/_*']
        )
            .pipe(less({
                //compress: false,//压缩 css
                compress: true,//压缩 css
            }))
            //.pipe(gulpMd5)
            .pipe(gulp.dest('src/assets/build_css'))
            .pipe(gulpLog('LESS编译完毕 --->'))
            .pipe(reload({stream:true}))
        ;
    return stream;
});

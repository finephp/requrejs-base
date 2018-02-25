/**
 * Created by wangtr on 2017/2/25.
 */
var gulp = require('gulp'),
useref = require('gulp-useref');
gulp.task('html-useref',function(){
    return gulp.src('./src/apps/**/**.html')
        .pipe(useref({
            noAssets:true
        }))
        .pipe(gulp.dest('./dist/apps'))
    ;
});
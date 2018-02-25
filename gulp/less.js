/**
 * Created by wangtr on 2017/2/25.
 */
var gulp = require('gulp');
var gulpLog = require('gulp-log'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    gulpMd5 = require('gulp-md5')(8)
    ;
gulp.task('less:build',['less:clean'],function(){
    var stream = gulp.src(
        [
        'src/assets/less/*.less',
        '!src/assets/less/_*.less',
        '!src/assets/less/**/_*']
        )
         //.pipe(less())
           .pipe(less({compress: true}))
            //.pipe(gulpMd5)
            .pipe(gulp.dest('src/assets/build_css'))
            .pipe(gulpLog('LESS编译完毕 --->'))
        ;
})
    .task('less:clean',function(){
        return gulp.src(['src/assets/build_css/**'], {
            read: false
        })
            .pipe(clean())
            .pipe(gulpLog('删除'));
    })
;
/*
gulp.task('build:less', env.cssCompress ? ['clean:less'] : null, function() {
    var name, srcPath, orgPath, tasks = [];
    for(name in lessList){
        orgPath = lessList[name];
        srcPath = path.join('less', lessList[name]) + '.less';
        orgPath = path.dirname(orgPath);

        (function(srcPath, orgPath){
            var s;
            if(env.cssCompress){
                s = gulp.src(srcPath)
                    .pipe(less({compress: true}))
                    .pipe(gulpMd5())
                    .pipe(gulp.dest(path.join('build_css', orgPath)))
                    .pipe(gulpLog('编译完毕 --->'));
            } else {
                s = gulp.src(srcPath)
                    .pipe(less({compress: false}))
                    .pipe(gulp.dest(path.join('local_css', orgPath)))
                    .pipe(gulpLog('编译完毕 --->'));
            }

            tasks.push(s);
        })(srcPath, orgPath);
    }

    return es.merge.apply(null, tasks);
});
*/

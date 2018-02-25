var gulp = require('gulp'),
    clean = require('gulp-clean');
gulp.task('copy',['copy:common','copy:vendor','copy:css','copy:images','copy:build_css']);
gulp.task('copy:common',function(){
    return gulp.src('./src/assets/js/common/require_config.js')
        .pipe(gulp.dest('./dist/assets/js/common'));
})
    .task('copy:vendor',['clean:vendor'],function(){
        return gulp.src('./src/assets/vendor/**/*')
            .pipe(gulp.dest('./dist/assets/vendor'));
    })
    .task('clean:vendor',function(){
        return gulp.src('./dist/assets/vendor',{read:false})
            .pipe(clean());
    })
    .task('copy:css',['clean:css'],function(){
        return gulp.src('./src/assets/css/**/*')
            .pipe(gulp.dest('./dist/assets/css'));
    })
    .task('clean:css',function(){
        return gulp.src('./dist/assets/css',{read:false})
            .pipe(clean());
    })
    .task('copy:images',['clean:images'],function(){
        return gulp.src('./src/assets/images/**/*')
            .pipe(gulp.dest('./dist/assets/images'));
    })
    .task('clean:images',function(){
        return gulp.src('./dist/assets/images',{read:false})
            .pipe(clean());
    })
    .task('copy:build_css',['clean:build_css'],function(){
        return gulp.src('./src/assets/build_css/**')
            .pipe(gulp.dest('./dist/assets/build_css'));
    })
    .task('clean:build_css',function(){
        return gulp.src('./dist/assets/build_css/**',{read:false})
            .pipe(clean());
    })
;
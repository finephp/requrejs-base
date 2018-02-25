//转换 css ，js 为 md5
var
    gulp  = require('gulp')
    ,rev = require('gulp-rev')
    ,revCollector = require('gulp-rev-collector')
    ,useref = require('gulp-useref')
    ,_uglify = require('gulp-uglify'),
    uglify = function(){
        return _uglify({output:{inline_script:false}});
    }
    ,gulpLog = require('gulp-log')
    ,clean = require('gulp-clean')
;
gulp.task('css-rev',function(){
    console.log('转换css...');
    return gulp.src(['src/css/*.css'])
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest({
            path: 'rev-manifest-css.json'
        }))
        .pipe(gulp.dest('dist/rev'));
});

gulp.task('html-css', ['css-rev'], function() {
    console.log('修改html模板');
    return gulp.src(['dist/rev/rev-manifest-css.json', 'src/apps/**/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../../css/': '/css/',
                '../../js/': '/js/',
                'cdn/': function(manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                }
            }
        }) )
        .pipe(gulp.dest('dist/apps'));
});

gulp
    .task('htmlrev:clean',function(){
        return gulp.src('./dist/assets/build/*',{read:false})
            .pipe(clean())
            ;
    });
gulp.task('htmlrev:md5',['htmlrev:clean'],function(){
    var config = {
        src: "./src/assets/build/**/*",
        dest:"./dist/assets/build/",
        rev: "./dist/assets/build/"
    };
    return gulp.src(config.src)
        .pipe(uglify())
        .pipe(rev())  //set hash key
        .pipe(gulpLog('编译完毕 -->'))
        .pipe(gulp.dest(config.dest))
        .pipe(rev.manifest({
            merge: true //
        })) //set hash key json
        .pipe(gulp.dest(config.rev)); //dest hash key json
});
gulp.task('htmlrev:html',['htmlrev:md5'],function(){
    return gulp.src(
        ['./dist/assets/build/rev-manifest.json',
            'src/apps/**/*.html'
        ])
        .pipe(revCollector({
            replaceReved: false,
            dirReplacements: {
                //'../../css/': '/css/',
                //'../../': '/js'
            }
        }))
        .pipe(useref({
            noAssets:true
         }))
        .pipe(gulp.dest('dist/apps'));
});
gulp.task('htmlrev',['htmlrev:html']);
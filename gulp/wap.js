/**
 * Created by wangtr on 2017/2/25.
 */
var gulp = require('gulp');
var gulpLog = require('gulp-log'),
    less = require('gulp-less'),
    qiniu = require('gulp-qiniu'),
    rjs = require('gulp-requirejs'),
    clean = require('gulp-clean'),
    gulpMd5 = require('gulp-md5'),
    uglify = require('gulp-uglify'),
    Q=require('q');
var _ = require('underscore');
var path = require('path');
var setting = require('../gulp_setting'),
    reqcfg = require('../require_config'),
    hashBuild = require('./hash');
var project_path = 'src/assets/wap';
var qiniuCfg = require('./qiniu.config.json');
var buildConfig = (function() {
    var pathRes = reqcfg.paths;
    var paths = _.extend({},pathRes,{
        'leancloud-storage':reqcfg._global.url.assets+ '/wap/lib/av/av',
        'underscore':reqcfg._global.url.assets+ '/wap/lib/underscore/index',
        'jquery':reqcfg._global.url.assets+ '/wap/lib/jquery/index',
        'js':reqcfg._global.url.assets+'/wap/js'
    });
    /*    Object.keys(pathRes).map(function(k){
     paths[k] = path.join(__dirname, pathRes[k].replace('../../','src/'));
     });*/
    return config = {
        config: {
            text: {
                useXhr: function (url, protocol, hostname, port) {
                    // allow crossdomain requests
                    // remote server allows CORS
                    return true;
                }
            }
        },
        paths: paths,
        shim: {
            'underscore': {
                'exports': '_'
            },
            'jquery':{
                'exports':'$'
            }
        }
    };
})();
//编译 less
gulp.task('wap:less',['wap:build_less'],function(){
    //写入hash
    console.log('开始写入 hash wap_css');
    hashBuild.wap_css();
}).task('wap:build_less',function(){
    var stream = gulp.src(
        [
            'src/assets/wap/less/**/*.less',
            '!src/assets/wap/less/**/_*.less'
        ])
            .pipe(less())
            .pipe(gulpMd5(10))
            .pipe(gulp.dest('src/assets/wap/build_css'))
            .pipe(gulpLog('编译less完毕 --->'))
        ;
    return stream;
});
//编译 js
gulp.task('wap', ['wap:build'])
    .task('wap:build', ['build:wap_requirejs'], function(){
        //写入hash
        console.log('开始写入 hash wap');
        hashBuild.wap();
    })
    .task('clean:wap',function(){
        return gulp.src(['src/assets/wap/build/*.js'], {read: false})
            .pipe(clean())
            .pipe(gulpLog('删除'));
    })
    .task('build:wap_requirejs', ['clean:wap'], wapRequire);
//上传到七牛
gulp.task('wap:publish',function(){
    var res = {};
    res.accessKey = qiniuCfg.cfg.accessKey;
    res.secretKey = qiniuCfg.cfg.secretKey;
    res.private = false;
    res.bucket = qiniuCfg.cfg.bucket;
    return gulp.src([
        project_path+'/**'
        ]
    ).pipe(qiniu(res, {
        dir: "assets/wap/"
    }));
});

function wapRequire(){
    return requirejsBuild(generateRequireWapjs(setting.wap_buildList));
}

function requirejsBuild(obj){
    var df = Q.defer();
    var count = 0,finish = 0;
    _.each(obj, function(v, k){
        count++;
        var s = rjs(v.options).pipe(uglify())
            .pipe(gulpMd5(10))
            .pipe(gulpLog('编译完毕-->'))
            .pipe(gulp.dest('.'))
                .on('data',function(){
                    if(++finish>=count){
                        df.resolve(count);
                    }
                })
            ;
    });
    return df.promise;
}
function generateRequireWapjs(targetList) {
    var obj = {};
    _.each(targetList, function(item) {
        obj[item] = {
            options: _.extend({}, buildConfig, {
                stubModules: ['text'],
                inlineText: true,
                findNestedDependencies: true,
                optimizeAllPluginResources: true,
                preserveLicenseComments: false,
                baseUrl: './src/assets/wap/js/'+ item,
                name: 'main',
                out: './src/assets/wap/build/' + item + '.js',
                exclude: [
                    'text',
                    'underscore',
                    'jquery',
                    //'js/base/main'
                ]
            })
        };
    });
    _.each({
        base: 'base'
    }, function(item){
        obj[item] = {
            options: _.extend({}, buildConfig, {
                stubModules: ['text'],
                inlineText: true,
                findNestedDependencies: true,
                optimizeAllPluginResources: true,
                preserveLicenseComments: false,
                baseUrl: './src/assets/wap/js/'+ item,
                name: 'main',
                out: './src/assets/wap/build/' + item + '.js',
                exclude: [
                    'text',
                ]
            })
        };
    });
    return obj;
}

var gulp = require('gulp')
    ,rjs = require('gulp-requirejs')
    ,clean = require('gulp-clean')
    ,gulpLog = require('gulp-log')
    ,gulpMd5 = require('gulp-md5')
    ,_uglify = require('gulp-uglify')
    ,uglify = function(){
        return _uglify({output:{inline_script:false}});
    }
    ,_ = require('underscore')
    , cluster = require('cluster')
    ,path = require('path')
    ,colors = require('gulp-util').colors
    ,log = console.log
    ,reqcfg = require('./require_config')
    ,sourcemaps = require('gulp-sourcemaps')
    ,rev = require('gulp-rev')
    ;
var setting = require('./gulp_setting')
    , buildList = setting.buildList
    ;
require('./gulp/copy');
require('./gulp/html-useref');
require('./gulp/htmlrev');
require('./gulp/less');
require('./gulp/wap');
require('./gulp/server');

var hashBuild = require('./gulp/hash');
var buildConfig = (function() {
    var pathRes = reqcfg.paths;
    var paths = _.extend({},pathRes,{
        'leancloud-storage':reqcfg._global.url.assets+ '/vendor/leancloud/av-min-1.2.1'
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
            }
        }
    };
})();


gulp
    .task('build:js', ['clean:www', 'fork'])
    .task('clean:www', function() {
        if (cluster.isWorker) {
            return;
        }
        return gulp.src(['./src/assets/build/js/**/*.js'], {
            read: false
        })
        .pipe(clean())
        .pipe(gulpLog('删除'));
    })
    .task('fork', forkBuild);

gulp.task('build-demo',function(cb){
    var build = {
        options: _.extend({}, buildConfig, {
            stubModules: ['text'],
            inlineText: true,
            findNestedDependencies: true,
            optimizeAllPluginResources: true,
            preserveLicenseComments: false,
            baseUrl: './src/assets/js/article',
            generateSourceMaps: true,
            name: 'main',
            out: './src/assets/build/js/demo.js',
            exclude: [
                'common/global'
            ]
        })
    };
    rjs(build.options)
        .pipe(rev())
        .pipe(gulpLog('编译完毕 -->'))
        .pipe(rev.manifest())
        //.pipe(sourcemaps.init({loadMaps: true})) // initialize gulp-sourcemaps with the existing map
        //.pipe(sourcemaps.write()) // write the source maps
        .pipe(gulp.dest('.'))
        .pipe(gulpLog('生成 manifest -->'))
        .on('end',cb)
        ;
});

createSingleBuildTask();

//建立独立的编译任务
function createSingleBuildTask(){
    Object.keys(buildList).forEach(function(k){
        gulp.task('build:' + k, function(){
            var target = {};
            target[k] = buildList[k];
            gulp.src('./src/assets/build/js/' + buildList[k] + '_??????????.js', {read: false})
                .pipe(clean())
                .pipe(gulpLog('删除'));
            forkSingleBuild(target);
        });
    });
}
//生成要编译的模块
function generateRequirejs(targetList) {
    var obj = {};
    _.each(targetList, function(item) {
        if (item === 'global') {
            obj.global = {
                options: _.extend({}, buildConfig, {
                    stubModules: ['text'],
                    inlineText: true,
                    findNestedDependencies: true,
                    optimizeAllPluginResources: true,
                    preserveLicenseComments: false,
                    baseUrl: './src/assets/js',
                    name: 'common/global',
                    out: './src/assets/build/js/global.js',
                    exclude:[
                        'leancloud-realtime'//排除编译
                        //'layui' //因为 layui是前端引入的，所以不需要加
                    ]
                })
            };
        } else {
            obj[item] = {
                options: _.extend({}, buildConfig, {
                    stubModules: ['text'],
                    inlineText: true,
                    findNestedDependencies: true,
                    optimizeAllPluginResources: true,
                    preserveLicenseComments: false,
                    baseUrl: './src/assets/js/' + item,
                    name: 'main',
                    out: './src/assets/build/js/' + item + '.js',
                    exclude: [
                        'text',
                        'common/global'
                    ]
                })
            };
        }
    });
    return obj;
}

function requirejsBuild(obj){
    _.each(obj, function(v, k){
        rjs(v.options)
            //.pipe(uglify())
            //.pipe(gulpMd5(10))
            .on('error', function(err) {
                console.error('build Error!', err.message);
                this.end();
            })
            .pipe(gulpLog('编译完毕 -->'))
            .pipe(gulp.dest('.'));
    });
}

function forkBuild(){
    var numWorker = require('os').cpus().length - 1;
    numWorker = Math.max(1, numWorker);
    var buildNum = Object.keys(buildList).length;
    //numWorker = Math.max(1, 2);
    if(cluster.isMaster){
        var start = new Date;
        console.log('开启%s个工作进程', numWorker);
        for(var i = 0; i < numWorker; i++){
            cluster.fork({
                number: i,
                piece_length: buildNum/numWorker
            });
        }

        cluster.on('exit', function(worker, code, signal){
            if(code !== 0){
                for (var id in cluster.workers) {
                    cluster.workers[id].kill();
                }
                log(colors.red('错误，打包失败！'));
            }
            //console.log('进程 ' + worker.process.pid + ' 结束');
        });

        cluster.disconnect(function(){
            //这个不能删，为了触发 每个 disconnect事件
            //console.log('init finish');
            //hashBuild.js(); 开始hash存为php
        });
        var finishNum = 0;
        cluster.on('disconnect', function (worker) {
            finishNum++;
            //console.log('[master] ' + 'disconnect: worker:'+finishNum ,numWorker);
            if(finishNum>=numWorker){
                var elapse = new Date - start;
                console.log('打包完毕，共耗时 %s 秒', toSec(elapse));
                hashBuild.js(); //开始hash存为php
            }
        });
    } else {
        var number = process.env.number
            , pieceLength = process.env.piece_length
            , itsList = Object.keys(buildList)
            .slice( pieceLength* number
                , pieceLength * (parseInt(number)+1))
            , temp = {};

        itsList.forEach(function(name){
            temp[name] = buildList[name];
        });
        requirejsBuild(generateRequirejs(temp));
    }
}

//执行单个编译程序
function forkSingleBuild(targetList){
    var numWorker = 1;
    if(cluster.isMaster){
        var start = new Date;
        for(var i = 0; i < numWorker; i++){
            cluster.fork({
                targetList: JSON.stringify(targetList)
            });
        }
        cluster.on('exit', function(worker, code, signal){
            if(code !== 0){
                for (var id in cluster.workers) {
                    cluster.workers[id].kill();
                }
                log(colors.red('错误，打包失败！'));
            }
            console.log('进程 ' + worker.process.pid + ' 结束');
        });

        cluster.disconnect(function(){
            var elapse = new Date - start;
            console.log('打包完毕，共耗时 %s 秒', toSec(elapse));
            //hashBuild.js(); 开始hash存为php
        });
    } else {
        var targetList = JSON.parse(process.env.targetList);
        requirejsBuild(generateRequirejs(targetList));
    }
}
function toSec(ms){
    return (ms/1000).toFixed(1);
}
gulp.task('build',['copy','html-useref']);
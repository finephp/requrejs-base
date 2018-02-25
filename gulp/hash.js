var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var child_process = require('child_process');
var env = require('./config/env');
var log = require('gulp-util').log;
var colors = require('gulp-util').colors;
/*
var qExec = Q.denodeify(child_process.execFile);
var findFile = function(arg) {
    console.log('arg',arg);
    return qExec('find', arg);
};
*/
var glob = require('glob');
var qExec = Q.denodeify(glob);
var assets_dir = 'assets/';
function findFile(arg){
    var pattern = assets_dir+arg.path+'/'+arg.ext;
    console.log(pattern);
    return qExec(pattern, {cwd:'src',nodir: true});
}

var headsInfo = {
    js: {
        ext: '/**/*.js',
        path:'build',
        versionFile: 'version_js.json'
    },
    wap:{
        ext:'*.js',
        path:'wap/build',
        versionFile:'version_wap.json',
    },
    wap_css: {
        ext: '*.css',
        path:'wap/build_css',
        versionFile: 'version_wap_css.json'
    },
    css: {
        ext: '*.css',
        versionFile: 'version_css.json',
        path: 'build_css'
    }
};

function initHashBuild() {
    var qs;
    var ins = {};

    Object.keys(headsInfo).forEach(function(name) {
        ins[name] = function() {
            return run([name]);
        };
    });

    ins.all = function() {
        return run(['js', 'css']);
    };

    function run(headsKeys) {
        headsKeys.forEach(function(key) {
            if (headsInfo[key].path == undefined) {
                headsInfo[key].path = 'build/' + key;
            }
        });


        qs = headsKeys.map(function(key) {
            return findFile({
                path:headsInfo[key].path,
                ext:headsInfo[key].ext
            });
        });

        return Q.all(qs)
            .then(function(results) {
                var pRecord = function(result, index) {
                    recordMd5(result, index, headsKeys);
                };

                results.forEach(pRecord);
            })
            .fail(function(reason) {
                log(colors.red(reason));
            });
    };

    function recordMd5(result, index, headsKeys) {
        var fileList = result;
        var indexOfHash;
        var base;
        var hash = {};
        var head;
        var info = headsInfo[headsKeys[index]];
        fileList.forEach(function(file) {
            if (file == undefined || file.trim() === '') {
                return;
            }

            indexOfHash = file.lastIndexOf('_');
            if (indexOfHash == -1) {
                log(colors.yellow('文件名非md5'), file);
                return;
            }

            base = file.slice(0, indexOfHash);

            if (base.indexOf(assets_dir+info.path) === 0) {
                head = info.path;
            }
            if (head == null) {
                throw '获取分类信息错误'+base+','+assets_dir+info.path;
            }
            if(head == 'wap/build') {
                base = base.split(head + '/')[1];
                if (head === 'wap/build') {
                    if (base != 'global') {
                        file = file.split('.js')[0];
                    }
                }
                hash[base] = file+'.js';
            }
            else {
                hash[base] = file;
            }
        });

        printHashToJson(info.versionFile, hash);
    }

    function printHashToJson(phpName, hash) {
        var k;
        var targetPath;
        var str = '';
        var hashArr = [];

        str += '{\r\n';

        for (k in hash) {
            hashArr.push({
                name: k,
                value: hash[k]
            });
        }

        hashArr.sort(function(a, b) {return a.name > b.name ? 1 : -1;}); //根据key进行排序

        hashArr.forEach(function(item, index) {
            str += ' "' + item.name + '" : "' + item.value + '"\r\n,';
        });

        str = str.slice(0, str.length - 1);
        str += '}';
        targetPath = path.join('src/assets/config', phpName);

        fs.writeFileSync(targetPath, str);
        log('hash写入 ' + targetPath + ' 成功');
        log('共 ' + Object.keys(hash).length + ' 个文件');
    }

    return ins;
}

var hashBuild = initHashBuild();

gulp.task('hash', hashBuild.all)
    .task('hash:css', hashBuild.css)
    .task('hash:js', hashBuild.js)
    .task('hash:wap', hashBuild.wap)
    .task('hash:wap_css', hashBuild.wap_css);
module.exports = hashBuild;

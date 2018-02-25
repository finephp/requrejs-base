var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var isProduction;

// make     打包，使用 --env 来判断是线上还是本地
// front    使用node APP_NODE_RUN_MODE
//
//gulp build --env
if (gutil.env.env) {
    isProduction = gutil.env.env === 'production';
} else {
    isProduction = process.env.APP_NODE_RUN_MODE == 'production';
}

module.exports = {
    isProduction: isProduction
};

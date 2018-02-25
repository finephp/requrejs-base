var _global = {
    url:{
        assets:__dirname+'/src/assets',
        assets_wap:__dirname+'/src/assets/wap',
    }
};
module.exports = {
    _global : _global,
    baseUrl: __dirname+'/src/assets/js/article',
    nodeRequire: require,
    paths:{
        text: _global.url.assets+ '/vendor/text',
        common: _global.url.assets+ '/js/common',
        vendor:_global.url.assets+ '/vendor',
        vue:_global.url.assets+ '/vendor/vue/vue',
        'vue-router':_global.url.assets+ '/vendor/vue/vue-router',
        lazyload:_global.url.assets+ '/vendor/lazyload/lazyload',
        'leancloud-storage':_global.url.assets+ '/vendor/leancloud/av-min-1.2.1',
        'leancloud-realtime':_global.url.assets+ '/vendor/mc/realtime.browser.min',
        echarts: 'http://echarts.baidu.com/build/dist',
        //layui:_global.url.assets+ '/vendor/layui/lay/dest/layui.all',
        //layui:'../../vendor/layui/layui',
        component:_global.url.assets+ '/js/component',
        jquery:_global.url.assets+ '/vendor/jquery/jquery-1.10.2',
        lodash:_global.url.assets+ '/vendor/lodash/lodash-3.10.1',
        js: _global.url.assets+ '/js',
        config: _global.url.assets+ '/config',
    },
    shim: {
        // 'jquery': {
        //     'exports': '$'
        // },
        // 'underscore': {
        //     'exports': '_'
        // },
        // 'common/test': {
        //     'exports': 'test'
        // },
        // 'AV':{
        //     'exports':'AV'
        // }
    }
};

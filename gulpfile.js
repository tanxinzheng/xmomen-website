/**
 * Created by tanxinzheng on 17/1/14.
 */
var url = require('url');
var fs = require('fs');
var path = require('path');
gulp = require('gulp');
livereload = require('gulp-livereload');
webserver = require('gulp-webserver');
mockApi = require('./mock');

//web服务器
gulp.task('server', function() {

    gulp.src('./www') // 服务器目录（./代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            port: 8000, //端口，默认8000
            livereload: true, // 启用LiveReload
            //open: true, // 服务器启动时自动打开网页
            directoryListing: {
                enable: true,
                path: './www'
            },
            //proxies: [
            //    {
            //        source: '/api', target: 'http://backend.api/api'
            //    }
            //],
            middleware: function(req, res, next) {
                var urlObj = url.parse(req.url, true),
                    method = req.method,
                    paramObj = urlObj.query;
                // mock数据
                mockApi(res, urlObj.pathname, paramObj, next);
            },
            open: 'http://localhost:8000/index.html'
        }));
});
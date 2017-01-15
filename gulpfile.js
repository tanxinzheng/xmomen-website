/**
 * Created by tanxinzheng on 17/1/14.
 */
var url = require('url');
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var mockApi = require('./mock');
var requirejsOptimize = require('gulp-requirejs-optimize');
var amdOptimize = require("amd-optimize");           //require优化
var sourcemaps = require('gulp-sourcemaps');

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

gulp.task('dist', function () {
    return gulp.src('www/app.js')
        .pipe(sourcemaps.init())
        .pipe(requirejsOptimize())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(){
    gulp.src('./www/assert')
        .pipe(clean());
})

gulp.task('rjs',['clean'], function () {
    gulp.src('./www/**/*.js')
        .pipe(amdOptimize("app", {
            configFile:"www/config.js"
        }))
        .pipe(concat("app.js"))           //合并
        .pipe(gulp.dest("./www"))           //输出保存
        .pipe(rename("app.min.js"))       //重命名
        .pipe(uglify())                     //压缩
        .pipe(gulp.dest("./www"));        //输出保存
});
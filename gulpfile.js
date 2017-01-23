/**
 * Created by tanxinzheng on 17/1/14.
 */
var url = require('url');
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var mockApi = require('./mock');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var requirejsOptimize = require('gulp-requirejs-optimize');
var amdOptimize = require("amd-optimize");           //require优化
var sourcemaps = require('gulp-sourcemaps');
var htmlreplace = require('gulp-html-replace');
var htmlmin = require('gulp-htmlmin');              //html压缩
var notify = require('gulp-notify');                //任务通知
var minifycss = require('gulp-minify-css');         //css压缩
var jshint = require('gulp-jshint');              //js检测
var rev = require('gulp-rev');                      //对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');   //路径替换

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


//脚本检查
gulp.task('jshint', function () {
    gulp.src('./www/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// html压缩
gulp.task('htmlmin' ,function() {
    gulp.src(['www/index.html'])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./build'));
    return gulp.src(['www/modules/**/*.html'])
        .pipe(htmlmin({collapseWhitespace: false}))
        .pipe(gulp.dest('./build/modules'))
        .pipe(notify({ message: 'html min task ok' }));

});

//css处理
gulp.task('css', function(){
    return gulp.src('www/css/*.css')            //设置css
        .pipe(concat('product.css'))            //合并css文件
        .pipe(gulp.dest('build/css'))           //设置输出路径
        .pipe(rename({suffix:'.min'}))          //修改文件名
        .pipe(minifycss())                      //压缩文件
        .pipe(rev())                            //生成MD5指纹
        .pipe(gulp.dest('build/css'))           //输出文件目录
        .pipe(rev.manifest())                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev'))               //- 将 rev-manifest.json 保存到 rev 目录内
        .pipe(notify({message:'css task ok'})); //提示成功
});

//html replace
gulp.task('html', function() {
    gulp.src('www/index.html')
        .pipe(htmlreplace({
            'css': 'css/product.min.css',
            'js': 'js/product.min.js'
        }))
        .pipe(gulp.dest('build/'))
        .pipe(notify({message:'html task ok'}));   //提示成功
});

// rev md5指纹替换
gulp.task('rev',['css'],function() {
    gulp.src(['./rev/rev-manifest.json', './build/index.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./build/'));                     //- 替换后的文件输出的目录
});

gulp.task('clean', function(){
    gulp.src(['./build/**'])
        .pipe(clean());
});

gulp.task('rjs',['clean'], function () {
    gulp.src('./www/main.js')
        .pipe(amdOptimize("main", {
            "appDir":"./www",
            "optimizeCss": "standard",
            "optimize": "uglify2",
            "mainConfigFile":"www/config.js",
            "generateSourceMaps": true,
            "preserveLicenseComments": false,
            "dir": "dist",
            "removeCombined": "true",
            "modules": [
                {
                    "name": "main",
                    "include": [
                        "./bower_components/angular/angular.min",
                        "./bower_components/angularAMD/angularAMD",
                        "./js/app.define"
                    ]
                }
            ]
        }))
        .pipe(concat("app.js"))           //合并
        .pipe(gulp.dest("./www"))           //输出保存
        .pipe(rename("app.min.js"))       //重命名
        .pipe(uglify())                     //压缩
        .pipe(gulp.dest("./www"));        //输出保存
});

gulp.task('rjs2',['clean'], function () {
    gulp.src('./www/*/**.js')
        .pipe(requirejsOptimize({
            "appDir":"./www",
            "optimizeCss": "standard",
            "optimize": "uglify2",
            "mainConfigFile":"www/config.js",
            "generateSourceMaps": true,
            "preserveLicenseComments": false,
            "dir": "dist",
            "removeCombined": "true",
            "modules": [
                {
                    "name": "main",
                    "include": [
                        "./bower_components/angular/angular.min",
                        "./bower_components/angularAMD/angularAMD",
                        "./js/app.define"
                    ]
                }
            ]
        }))
        .pipe(concat("app.js"))           //合并
        .pipe(gulp.dest("./www"))           //输出保存
        .pipe(rename("app.min.js"))       //重命名
        .pipe(uglify())                     //压缩
        .pipe(gulp.dest("./www"));        //输出保存
});

gulp.task('default',['clean', 'css', 'html'], function(){
});
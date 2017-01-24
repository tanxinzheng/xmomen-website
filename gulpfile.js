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
var $ = require("gulp-load-plugins")();
var imagemin = require('gulp-imagemin');
var usemin = require('gulp-usemin');
var sourcemaps = require('gulp-sourcemaps');
var copy = require('gulp-copy');
var htmlmin = require('gulp-htmlmin');              //html压缩
var notify = require('gulp-notify');                //任务通知
var minifycss = require('gulp-minify-css');         //css压缩
var jshint = require('gulp-jshint');              //js检测
var csslint = require('gulp-csslint');              //css检测
var rev = require('gulp-rev');                      //对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');   //路径替换
var gulpsync = require('gulp-sync')(gulp);

var environment = require("./environments.json");
var ENV = environment['production'];
//web服务器
gulp.task('server', function() {
    gulp.src(ENV.serverPath) // 服务器目录（./代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            port: ENV.port, //端口，默认8000
            livereload: true, // 启用LiveReload
            //open: true, // 服务器启动时自动打开网页
            directoryListing: {
                enable: true,
                path: ENV.serverPath
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
            open: 'http://localhost:' + ENV.port + '/index.html'
        }));
});

// clean
gulp.task('clean', function(){
    return gulp.src(['build/**', 'rev/**', 'temp/**'], {read: false})
        .pipe(clean());
});

// js检查
gulp.task('jshint', function () {
    gulp.src('./www/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// css检查
gulp.task('csslint', function (cb) {
    var output = '';
    gulp.src('./www/css/**/*.css')
        .pipe(csslint())
        .pipe(csslint.formatter('junit-xml', {logger: function(str) { output += str; }}))
        .on('end', function(err) {
            if (err) return cb(err);
            fs.writeFile('csslint_report.xml', output, cb);
        });
});

// html压缩
gulp.task('htmlmin', function() {
    return gulp.src(['www/**/*.html', 'temp/index.html', '!www/bower_components/**'])
        .pipe(gulp.dest('build'))
        .pipe(notify({ message: 'html min task ok' }));

});

// fonts
gulp.task('fonts', function() {
    return gulp.src(['www/fonts/**'])
        .pipe(gulp.dest('build/fonts'))
        .pipe(notify({ message: 'fonts task ok' }));

});

//css处理
gulp.task('css', function(){
    return gulp.src('temp/css/*.css')            //设置css
        .pipe(concat('product.css'))            //合并css文件
        .pipe(gulp.dest('build/css'))           //设置输出路径
        .pipe(rename({suffix:'.min'}))          //修改文件名
        .pipe(minifycss())                      //压缩文件
        .pipe(rev())                            //生成MD5指纹
        .pipe(gulp.dest('build/css'))           //输出文件目录
        .pipe(rev.manifest({
            merge: true // merge with the existing manifest (if one exists)
        }))                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev'))               //- 将 rev-manifest.json 保存到 rev 目录内
        .pipe(notify({message:'css task ok'})); //提示成功
});

// images
gulp.task('img', function () {
    return gulp.src('www/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('build/img'));
});

gulp.task('html', function() {
    return gulp.src('www/index.html')
        .pipe($.usemin({
            jsAttributes : {
                'data-main' : 'main'
            },
            css: [$.minifyCss()]
        }))
        .pipe(gulp.dest('temp'));
});

//gulp.task('rev', function () {
//    return gulp.src(['build/css/*.css', 'build/js/*.js'])
//        .pipe(gulp.dest('build/assets'))  // copy original assets to build dir
//        .pipe(rev())
//        .pipe(gulp.dest('build/assets'))  // write rev'd assets to build dir
//        .pipe(rev.manifest())
//        .pipe(gulp.dest('build/assets')); // write manifest to build dir
//});

// rev md5指纹替换
gulp.task('rev', function() {
    return gulp.src(['./rev/rev-manifest.json', './build/index.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('build'));                     //- 替换后的文件输出的目录
});

// rjs
gulp.task('rjs', function () {
    return gulp.src('www/main.js')
        .pipe(sourcemaps.init())
        .pipe(requirejsOptimize({
            mainConfigFile:"www/config.js",
            optimize: 'none',
            generateSourceMaps:true
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build'));
});

// js
gulp.task('js', function(){
    return gulp.src([
        'www/bower_components/requirejs/require.js',
        'build/app.js'])
        .pipe(concat('product.js'))
        .pipe(gulp.dest('./build/js'))
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))          //修改文件名
        .pipe(rev())                            //生成MD5指纹
        .pipe(gulp.dest('./build/js'))
        .pipe(rev.manifest({
            merge: true // merge with the existing manifest (if one exists)
        }))                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev'))               //- 将 rev-manifest.json 保存到 rev 目录内
        .pipe(notify({message:'js task ok'})); //提示成功
});



gulp.task('default',gulpsync.sync(['clean', 'html', 'css', 'rjs', 'js', 'img', 'htmlmin', 'fonts', 'rev']));
/**
 * Created by tanxinzheng on 16/8/11.
 */
require.config({
    baseUrl:"./",
    paths: {
        "jquery":"bower_components/jquery/dist/jquery",
        "angular": "bower_components/angular/angular",
        "angularAMD": "bower_components/angularAMD/angularAMD",
        "angular-ui-router": "bower_components/angular-ui-router/release/angular-ui-router",
        "ui-bootstrap-tpls":"bower_components/angular-bootstrap/ui-bootstrap-tpls",
        "loading-bar": "bower_components/angular-loading-bar/build/loading-bar",
        "ocLazyLoad":"bower_components/oclazyload/dist/ocLazyLoad.min",
        "angular-translate":"bower_components/angular-translate/angular-translate",
        "angular-local-storage":"bower_components/angular-local-storage/dist/angular-local-storage",
        "angular-resource":"bower_components/angular-resource/angular-resource",
        "angular-sanitize":"bower_components/angular-sanitize/angular-sanitize",
        "angular-animate":"bower_components/angular-animate/angular-animate",
        "angular-cookies":"bower_components/angular-cookies/angular-cookies",
        "layer":"bower_components/layer/build/layer",
        "ng-file-upload":"bower_components/ng-file-upload/ng-file-upload-all",
        "loader-static-files":"bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files",
        "storage-cookie":"bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie",
        "storage-local":"bower_components/angular-translate-storage-local/angular-translate-storage-local",
        "ui-xmomen":"bower_components/angular-ui-xmomen/dist/ui-xmomen.min",
        "app.module":"modules/app.module",
        "config": "js/config",
        "config-lazyload": "js/config.lazyload",
        // "config-i18n": "js/config.i18n",
        "config-router": "js/config.router"
    },
    shim: {
        "jquery" : { exports : "jquery" },
        "angular": { exports: "angular" },
        "angularAMD": ["angular"],
        "angular-ui-router": ["angular"],
        "ui-bootstrap-tpls": ["angular"],
        "loading-bar" : ["angular"],
        "ocLazyLoad":["angular"],
        "ui-xmomen": {
            deps:['angular']
        },
        "ng-file-upload":["angular"],
        "angular-local-storage":["angular"],
        "angular-sanitize":["angular"],
        "angular-cookies": ["angular"],
        "angular-resource": ["angular"],
        "angular-animate": ["angular"],
        "angular-translate": ["angular"],
        "loader-static-files":["angular", "angular-translate"],
        "storage-cookie":["angular","angular-translate"],
        "storage-local":["angular","angular-translate"]
    },
    deps: ['app']
});

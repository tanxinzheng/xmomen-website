/**
 * Created by tanxinzheng on 16/8/11.
 */
require.config({
    //baseUrl:"./",
    paths: {
        "jquery":"bower_components/jquery/dist/jquery.min",
        "angular": "bower_components/angular/angular.min",
        "angular-ui-router": "bower_components/angular-ui-router/release/angular-ui-router",
        "ui-bootstrap-tpls":"bower_components/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "bower_components/angularAMD/angularAMD",
        "permission":"bower_components/angular-permission/dist/angular-permission.min",
        "toaster":'bower_components/AngularJS-Toaster/toaster',
        "loading-bar": "bower_components/angular-loading-bar/build/loading-bar",
        "jquery-validate":"bower_components/jquery-validation/dist/jquery.validate",
        "jquery-validate-local":"bower_components/jquery-validation/src/localization/messages_zh",
        "datetimepicker": "bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker",
        "ocLazyLoad":"bower_components/oclazyload/dist/ocLazyLoad.min",
        "angular-translate":"bower_components/angular-translate/angular-translate",
        "angular-local-storage":"bower_components/angular-local-storage/dist/angular-local-storage",
        "angular-resource":"bower_components/angular-resource/angular-resource",
        "angular-animate":"bower_components/angular-animate/angular-animate",
        "angular-cookies":"bower_components/angular-cookies/angular-cookies",
        "loader-static-files":"bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files",
        "storage-cookie":"bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie",
        "storage-local":"bower_components/angular-translate-storage-local/angular-translate-storage-local",

        "xmomen-ui":"js/core/xmomen-ui/xmomen",
        "app.module":"modules/app.module",
        "config": "js/config",
        "config-lazyload": "js/config.lazyload",
        "config-i18n": "js/config.i18n",
        "config-router": "js/config.router",
        "app":"js/app.define"
    },
    map: {
        '*': {
            'css': 'bower_components/require-css/css'
        }
    },
    shim: {
        "jquery" : { exports : "jquery" },
        "datetimepicker" : ["jquery","css!bower_components/bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min"],
        "angular": { exports: "angular" },
        "angular-ui-router": ["angular"],
        "ui-bootstrap-tpls": ["angular"],
        "angularAMD": ["angular"],
        "toaster" : ["css!bower_components/AngularJS-Toaster/toaster"],
        "loading-bar" : ["css!bower_components/angular-loading-bar/build/loading-bar"],
        "depLib":[
            "ocLazyLoad"
        ],
        "jquery-validate-local":[
            "jquery-validate"
        ],
        "loader-static-files":["angular-translate"],
        "storage-cookie":["angular-translate"],
        "storage-local":["angular-translate"],
        "app": [
            "ocLazyLoad",
            "angular-cookies",
            "angular-resource",
            "angular-animate",
            "angular-local-storage",
            "angular-translate",
            "loader-static-files",
            "storage-cookie",
            "storage-local",
            "angular-ui-router",
            "angular",
            "ui-bootstrap-tpls",
            "angularAMD",
            "loading-bar",
            "jquery-validate-local",
            "toaster",
            "xmomen-ui",
            "app.module", "config",
            "config-lazyload", "config-i18n", "config-router"
        ]
    }
});

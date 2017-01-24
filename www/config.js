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
        "permission":"bower_components/angular-permission/dist/angular-permission.min",
        "toaster":'bower_components/AngularJS-Toaster/toaster',
        "loading-bar": "bower_components/angular-loading-bar/build/loading-bar",
        "jquery-validate":"bower_components/jquery-validation/dist/jquery.validate",
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
        "main":"main"
    },
    shim: {
        "jquery" : { exports : "jquery" },
        "datetimepicker" : ["jquery"],
        "angular": { exports: "angular" },
        "angularAMD": ["angular"],
        "angular-ui-router": ["angular"],
        "ui-bootstrap-tpls": ["angular"],
        "toaster" : ["angular"],
        "loading-bar" : ["angular"],
        "ocLazyLoad":["angular"],
        "jquery-validate":{
            deps:['jquery'],
            exports:"$.validator"
        },
        "angular-local-storage":["angular"],
        "angular-cookies": ["angular"],
        "angular-resource": ["angular"],
        "angular-animate": ["angular"],
        "angular-translate": ["angular"],
        "loader-static-files":["angular", "angular-translate"],
        "storage-cookie":["angular","angular-translate"],
        "storage-local":["angular","angular-translate"],
        "main": [
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
            "jquery-validate",
            //"jquery-validate-local",
            "toaster",

            "xmomen-ui",
            "app.module",
            "config",
            "config-lazyload",
            "config-i18n",
            "config-router"
        ]
    }
});

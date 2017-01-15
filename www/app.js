/**
 * Created by tanxinzheng on 16/8/11.
 */
require.config({
    paths: {
        "angular": "bower_components/angular/angular",
        "angular-ui-router": "bower_components/angular-ui-router/release/angular-ui-router",
        "ui-bootstrap-tpls":"bower_components/angular-bootstrap/ui-bootstrap-tpls",
        "angularAMD": "bower_components/angularAMD/angularAMD",
        "permission":"bower_components/angular-permission/dist/angular-permission.min",
        "toaster":'bower_components/AngularJS-Toaster/toaster',
        "loading-bar": "bower_components/angular-loading-bar/build/loading-bar",
        "jquery-validate":"bower_components/jquery-validation/dist/jquery.validate",
        "datetimepicker": "bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker",

        "app.module":"modules/app.module",
        "jquery":"js/core/jquery.min",
        "xmomen-ui":"js/core/xmomen-ui/xmomen",
        "config": "js/config",
        "config-lazyload": "js/config.lazyload",
        "config-i18n": "js/config.i18n",
        "config-router": "js/config.router",
        "App":"js/app.define"
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

        ],
        "App": [ "app.module", "ui-bootstrap-tpls", "angularAMD", "xmomen-ui", "loading-bar",
            "config", "config-lazyload", "config-i18n", "config-router", "jquery-validate", "toaster"]
    }
});
define(["angular", "angularAMD", "App", "angular-ui-router"], function (angular, angularAMD, App) {
    angular.element(document).ready(function() {
        $.get('/account/permissions', function(data) {
            var permissionList = data;
            angularAMD.bootstrap(App);
        });
    });
});
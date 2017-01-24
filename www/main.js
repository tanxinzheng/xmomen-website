require(['require'], function(require){
    'use strict';
    var angular = require('angular');
    var angularAMD = require('angularAMD');
    var ngApp = angular.module('app', [

        'ui.bootstrap',
        //'ngStorage',

        'ngAnimate',
        'ngCookies',
        'ngResource',
        //'ngSanitize',
        //'ngTouch',
        "toaster",
        'oc.lazyLoad', //懒加载包
        'pascalprecht.translate',
        'xmomen.ui',
        'LocalStorageModule',
        'ui.router',
        //'ui.router.extras.tabs',
        "angular-loading-bar",
        //'permission',
        'app.module',
        "config.router",
        "config.lazyload",
        "config",
        "config.i18n"
    ]);
    angular.element(document).ready(function() {
        $.get('/account/permissions', function(data) {
            var permissionList = data;
            angularAMD.bootstrap(ngApp);
        });
    });
});
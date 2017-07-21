require(['require'], function(require){
    'use strict';
    var angular = require('angular');
    var angularAMD = require('angularAMD');
    var ngApp = angular.module('app', [
        'ui.bootstrap',
        'uia',
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'oc.lazyLoad', //懒加载包
        'pascalprecht.translate',
        // 'xmomen.ui',
        'LocalStorageModule',
        'ui.router',
        "angular-loading-bar",
        'app.module',
        "config.router",
        "config.lazyload",
        "config",
        "config.i18n"
    ]);
    angular.element(document).ready(function() {
        angularAMD.bootstrap(ngApp);
    });
});
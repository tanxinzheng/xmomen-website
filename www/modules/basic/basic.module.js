'use strict';

/**
 * Config for the router
 */
define([
    "angular",
    "angularAMD",
    // "modules/app.api",
],function(angular, angularAMD){
    return angular.module('basic.module',[]).config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {

        var states = [];

        states.push({
            name: 'app',
            url: '/app',
            templateUrl: 'modules/app.html',
            abstract: true
        });

        states.push({
            name: 'app.dashboard',
            url: '/dashboard',
            controllerUrl: 'modules/basic/dashboard.js',
            templateUrl: 'modules/basic/dashboard.html'
        });

        states.push({
            title: "安全中心",
            name:"app.security",
            url: '/account/security',
            templateUrl: 'modules/basic/account_security.html',
            controllerUrl: 'modules/basic/account_security.js'
        });

        states.push({
            name: 'access',
            url: '/access',
            template: '<div ui-view class="fade-in-right-big smooth"></div>'
        });

        states.push({
            title: "登录",
            name:"access.signin",
            url: '/signin',
            templateUrl: 'modules/basic/signin.html',
            controllerUrl: 'modules/basic/signin.js'
        });

        states.push({
            title: "注册",
            name:"access.signup",
            url: '/signup',
            templateUrl: 'modules/basic/signup.html',
            controllerUrl: 'modules/basic/signup.js',
        });

        states.push({
            title: "找回密码",
            name:"access.find_password",
            url: '/find_password',
            templateUrl: 'modules/basic/find_password.html',
            controllerUrl: 'modules/basic/find_password.js'
        });

        states.push({
            title: "基本资料",
            name:"app.account",
            url: '/account/information',
            templateUrl: 'modules/basic/account_information.html'
        });

        angular.forEach(states, function(state){
            $stateProvider.state(state.name, angularAMD.route(state));
        });
    }]);
});
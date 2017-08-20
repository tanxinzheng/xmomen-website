'use strict';

/**
 * Config for the router
 */
define(function(require){
    var angular = require('angular');
    var angularAMD = require('angularAMD');
    var navMenu = [];
    angular.module("config.router",[]).config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider,   $urlRouterProvider) {

            $urlRouterProvider
                .otherwise('/app/dashboard');

            navMenu = [];

            navMenu.push({
                icon:"fa fa-user",
                group:"authorization",
                title:"用户",
                name:"app.user",
                url: '/user',
                permission:'USER:VIEW',
                templateUrl: 'modules/authorization/user.html',
                controllerUrl: 'modules/authorization/user',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/authorization/user.api.js',
                            'modules/authorization/user_group.api.js',
                            'modules/authorization/user_permission.api.js'
                        ]);
                    }]
                }
            });

            navMenu.push({
                icon:"fa fa-group",
                group:"authorization",
                title:"用户组",
                name:"app.group",
                url: '/group',
                templateUrl: 'modules/authorization/group.html',
                controllerUrl: 'modules/authorization/group',
                permission:'GROUP:VIEW',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/authorization/group.api.js',
                            'modules/authorization/group_permission.api.js',
                        ]);
                    }]
                }
            });

            navMenu.push({
                icon:'fa fa-key',
                group:"authorization",
                title:"权限",
                name:"app.permission",
                url: '/permission',
                templateUrl: 'modules/authorization/permission.html',
                controllerUrl: 'modules/authorization/permission',
                permission:'GROUP:VIEW',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/authorization/permission.api.js');
                    }]
                }
            });

            navMenu.push({
                icon:"fa fa-book",
                group:"system",
                title:"数据字典",
                name:"app.dictionary",
                url: '/dictionary',
                templateUrl: 'modules/system/dictionary.html',
                controllerUrl: 'modules/system/dictionary',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/system/dictionary.api.js');
                    }]
                }
            });

            navMenu.push({
                icon:"fa fa-file-text-o",
                group:"system",
                title:"操作记录",
                name:"app.action_log",
                url: '/action_log',
                templateUrl: 'modules/system/action_log.html',
                controllerUrl: 'modules/system/action_log',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/system/action_log.api.js');
                    }]
                }
            });

            navMenu.push({
                icon:"fa fa-tasks",
                group:"system",
                title:"调度任务",
                name:"app.schedule",
                url: '/schedule',
                templateUrl: 'modules/system/schedule.html',
                controllerUrl: 'modules/system/schedule',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/system/schedule.api.js');
                    }]
                }
            });

            navMenu.push({
                icon:"icon-paper-clip",
                group:"system",
                title:"附件",
                name:"app.attachment",
                url: '/attachment',
                templateUrl: 'modules/system/attachment.html',
                controllerUrl: 'modules/system/attachment',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/system/attachment.api.js');
                    }]
                }
            });

            navMenu.push({
                icon:"fa fa-picture-o",
                group:"docs",
                title:"图标",
                name:"app.icon",
                url: '/icon',
                templateUrl: 'modules/docs/ui_icons.html'
            });

            angular.forEach(navMenu, function(state){
                $stateProvider.state(state.name, angularAMD.route(state));
            })
        }
    ]).factory('TokenService', ["$q", "$window", function ($q, $window) {
        return {
            authentication: function () {
                var defer = $q.defer();
                if ($window.sessionStorage.token) {
                    defer.resolve(true);
                }else{
                    defer.reject(false);
                }
                return defer.promise;
            },
            removeToken: function () {
                delete $window.sessionStorage.token;
            }
        };
    }]).run(['$rootScope', '$state', '$stateParams', '$urlRouter', '$http', 'PermPermissionStore', 'TokenService',
        function ($rootScope, $state, $stateParams, $urlRouter, $http, PermPermissionStore, TokenService) {
            $rootScope.navMenu = navMenu;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (!toState.ignoreAuth) {
                    TokenService.authentication().then(function () {

                    }, function () {
                        event.preventDefault();
                        $state.go('access.signin');
                    })
                }
            });
        }
    ]);
});
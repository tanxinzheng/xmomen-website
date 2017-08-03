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
                group:"authorization",
                title:"用户",
                name:"app.user",
                url: '/user',
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
                group:"authorization",
                title:"用户组",
                name:"app.group",
                url: '/group',
                templateUrl: 'modules/authorization/group.html',
                controllerUrl: 'modules/authorization/group',
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
                group:"authorization",
                title:"权限",
                name:"app.permission",
                url: '/permission',
                templateUrl: 'modules/authorization/permission.html',
                controllerUrl: 'modules/authorization/permission',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/authorization/permission.api.js');
                    }]
                }
            });

            navMenu.push({
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

            angular.forEach(navMenu, function(state){
                $stateProvider.state(state.name, angularAMD.route(state));
            })
        }
    ]).run(['$rootScope', '$state', '$stateParams', '$urlRouter', '$http',
        function ($rootScope,   $state, $stateParams, $urlRouter, $http) {
            $rootScope.navMenu = navMenu;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $http
                .get('/permissions')
                .then(function(permissions){
                    // Use RoleStore and PermissionStore to define permissions and roles
                    // or even set up whole session
                })
                .then(function(){
                    // Once permissions are set-up
                    // kick-off router and start the application rendering
                    $urlRouter.sync();
                    // Also enable router to listen to url changes
                    $urlRouter.listen();
                });
        }
    ]);
});
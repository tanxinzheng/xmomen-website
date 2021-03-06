'use strict';

/**
 * Config for the router
 */
define(function(require){
    var angular = require('angular');
    var angularAMD = require('angularAMD');
    var navMenu = [];
    angular.module("config.router",[]).config(['$stateProvider', '$urlRouterProvider','$httpProvider',
        function ($stateProvider,   $urlRouterProvider, $httpProvider) {

            $urlRouterProvider
                .otherwise('/app/dashboard');

            navMenu = [];

            navMenu.push({
                icon:"fa fa-user",
                group:"authorization",
                title:"用户",
                name:"app.user",
                url: '/user',
                templateUrl: 'modules/authorization/user.html',
                controllerUrl: 'modules/authorization/user',
                permission:"USER:VIEW",
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
                permission:"GROUP:VIEW",
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
                permission:"PERMISSION:VIEW",
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
                permission:"DICTIONARY:VIEW",
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
                permission:"ACTION_LOG:VIEW",
                data: {
                    permissions: {
                        only: ['ACTION_LOG:VIEW']
                    }
                },
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
                permission:"SCHEDULE_TASK:VIEW",
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
                permission:'ATTACHMENT:VIEW',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('modules/system/attachment.api.js');
                    }]
                }
            });

            // navMenu.push({
            //     icon:"icon icon-bell",
            //     group:"notification",
            //     title:"通知模板",
            //     name:"app.notification_template",
            //     url: '/notification_template',
            //     templateUrl: 'modules/notification/notification_template.html',
            //     controllerUrl: 'modules/notification/notification_template',
            //     resolve: {
            //         deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
            //             return $ocLazyLoad.load('modules/notification/notification_template.api.js');
            //         }]
            //     }
            // });

            // mail
            // .state('app.mail', {
            //     abstract: true,
            //     url: '/mail',
            //     templateUrl: 'tpl/mail.html',
            //     // use resolve to load other dependences
            //     resolve: {
            //         deps: ['uiLoad',
            //             function( uiLoad ){
            //                 return uiLoad.load( ['js/app/mail/mail.js',
            //                     'js/app/mail/mail-service.js',
            //                     'vendor/libs/moment.min.js'] );
            //             }]
            //     }
            // })
            //     .state('app.mail.list', {
            //         url: '/inbox/{fold}',
            //         templateUrl: 'tpl/notification.list.html'
            //     })
            //     .state('app.mail.detail', {
            //         url: '/{mailId:[0-9]{1,4}}',
            //         templateUrl: 'tpl/notification.detail.html'
            //     })
            //     .state('app.mail.compose', {
            //         url: '/compose',
            //         templateUrl: 'tpl/notification.new.html'
            //     })
            navMenu.push({
                // icon:"icon icon-bell",
                abstract: true,
                group:"notification",
                // title:"通知",
                name:"app.notification",
                url: '/notification',
                templateUrl: 'modules/notification/notification.html',
                controllerUrl: 'modules/notification/notification',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/notification/notification.api.js',
                            'modules/notification/notification_send.api.js'
                        ]);
                    }]
                }
            });
            navMenu.push({
                icon:"icon icon-bell",
                group:"notification",
                title:"通知",
                name:"app.notification.list",
                url: '/{dataState}',
                templateUrl: 'modules/notification/notification.list.html',
                controllerUrl: 'modules/notification/notification.list',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/notification/notification.api.js',
                            'modules/notification/notification_send.api.js'
                        ]);
                    }]
                }
            });
            navMenu.push({
                group:"notification",
                name:"app.notification.detail",
                url: '/{dataState}/{id}',
                templateUrl: 'modules/notification/notification.detail.html',
                controllerUrl: 'modules/notification/notification.detail.js',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/notification/notification.api.js',
                            'modules/notification/notification_send.api.js'
                        ]);
                    }]
                }
            });
            navMenu.push({
                group:"notification",
                name:"app.notification.new",
                url: '/compose',
                templateUrl: 'modules/notification/notification.new.html',
                controllerUrl: 'modules/notification/notification',
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load([
                            'modules/notification/notification.api.js',
                            'modules/notification/notification_send.api.js'
                        ]);
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
            });

            // 阻塞路由渲染
            $urlRouterProvider.deferIntercept();
        }
    ]).run(['$rootScope', '$state', '$stateParams', '$urlRouter', '$http', 'PermPermissionStore', 'TokenService', 'uiaMessage', 'AccountAPI',
        function ($rootScope, $state, $stateParams, $urlRouter, $http, PermPermissionStore, TokenService, uiaMessage, AccountAPI) {
            $rootScope.navMenu = navMenu;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if(toState.name != 'lock' && window.sessionStorage.isLocked){
                    $state.go('lock');
                    event.preventDefault();
                }
                if (!toState.ignoreAuth) {
                    TokenService.authentication().then(function () {

                    }, function () {
                        PermPermissionStore.clearStore();
                        window.location.href = "/access.html";
                        event.preventDefault();
                    });
                }
            });
            uiaMessage.subscribe('unAuthentication', function () {
                window.location.href = "/access.html";
            });
            TokenService.authentication().then(function () {
                AccountAPI.getPermissions({}, function(resp){
                    angular.forEach(resp.permissions, function (val) {
                        PermPermissionStore.defineManyPermissions(resp.permissions, function(permissionName, data){
                            return angular.contains(resp.permissions, permissionName);
                        });
                    });
                }).$promise.finally(function(){
                    // Once permissions are set-up
                    // kick-off router and start the application rendering
                    $urlRouter.sync();
                    // Also enable router to listen to url changes
                    $urlRouter.listen();
                });
            }, function () {
                window.location.href = "/access.html";
            })
        }
    ]);
});
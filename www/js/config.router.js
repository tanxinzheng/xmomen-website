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
                name: 'app',
                url: '/app',
                templateUrl: 'modules/app.html',
                abstract: true
            });

            navMenu.push({
                name: 'app.dashboard',
                url: '/dashboard',
                controllerUrl: 'modules/dashboard.js',
                templateUrl: 'modules/dashboard.html'
            });

            navMenu.push( {
                title:"文档",
                name: 'app.documents',
                url: '/documents',
                templateUrl: 'modules/system/docs.html',
                resolve: {
                    deps: ['$ocLazyLoad',function( $ocLazyLoad){
                        return $ocLazyLoad.load('tpl/tools/directives/ui-scroll.js');
                    }]
                }
            });

            // navMenu.push({
            //     title:"403",
            //     name:"unauthorized",
            //     url: '/unauthorized',
            //     templateUrl: 'views/error/error403.html'
            // });

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
    ]).run(['$rootScope', '$state', '$stateParams',
        function ($rootScope,   $state, $stateParams) {
            $rootScope.navMenu = navMenu;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]);
});
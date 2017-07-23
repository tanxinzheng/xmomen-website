// config
define(function(require){
    var angular = require('angular');
    angular.module("config",['uia']).factory("SelectAPI",["$resource",function($resource){
        return $resource("/api/select/cache/:id", { id:"@id" }, {
            query:{ isArray:true, method:"GET"}
        });
    }]).config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', "$logProvider", "$httpProvider",
        function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide, $logProvider, $httpProvider) {

            // cfpLoadingBarProvider.latencyThreshold = 500;
            // cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
            // cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
            // $logProvider.debugEnabled(true);
            //$uiaValidateDefault
            // lazy controller, directive and service
            //App.controller = $controllerProvider.register;
            //App.directive  = $compileProvider.directive;
            //App.filter     = $filterProvider.register;
            //App.factory    = $provide.factory;
            //App.service    = $provide.service;
            //App.constant   = $provide.constant;
            //App.value      = $provide.value;
        }
    ]);
});
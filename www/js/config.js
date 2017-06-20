// config
define(function(require){
    var angular = require('angular');
    angular.module("config",[]).config(
    ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', "$logProvider", "$httpProvider",
        "cfpLoadingBarProvider", '$uiaValidateDefault','uiaDialog',
        function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide, $logProvider, $httpProvider,
                  cfpLoadingBarProvider, $uiaValidateDefault, uiaDialog) {
            cfpLoadingBarProvider.latencyThreshold = 500;
            cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
            cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
            $logProvider.debugEnabled(true);
            $uiaValidateDefault =  {
                errorElement: "div",
                errorClass:"error",
                errorPlacement: function(error, element) { //指定错误信息位置
                    uiaDialog.alert(error);
                }
            };
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
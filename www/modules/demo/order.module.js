'use strict';

/**
 * @author  tanxinzheng
 * @date    2016-12-22 23:26:01
 * @version 1.0.0
 */
define([
    "angularAMD",
    "./order.api",
    "./order"
],function(angularAMD, OrderRest, order){
    angular.module('order.module',[
        "Order.REST"
    ]).config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider,   $urlRouterProvider) {

            var states = [];

            states.push({
                title: "订单",
                name: 'app.order',
                url: '/order',
                controller: order,
                templateUrl: 'modules/demo/order.html'
            });

            angular.forEach(states, function(state){
                $stateProvider.state(state.name, angularAMD.route(state));
            });
        }
    ]);
});
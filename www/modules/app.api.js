/**
 * Created by Jeng on 2016/1/28.
 */
define(function (require) {
    var angular = require('angular');
    return angular.module("App.REST",[
        "ngResource",
        "ui.bootstrap"
    ]).factory('Resource', [ '$resource', '$injector', "$timeout", function( $resource , $injector, $timeout) {

        return function( url, params, methods ) {
            var defaults = {
                query: {method: "GET", isArray: false},
                update: { method: 'PUT' },
                create: { method: 'POST' }
            };

            methods = angular.extend( defaults, methods );

            var resource = $resource( '/api' + url, params, methods );

            resource.$export = function(option, success, fail) {
                var params = "";
                if(option && option.data){
                    for(var p in option.data){
                        if(option.data[p]){
                            params += p + "=" + option.data[p] + "&";
                        }
                    }
                    params = "?"+params;
                }
                var anchor = angular.element("<iframe/>");
                anchor.attr({
                    style:"display:none",
                    src: option.url + params,
                    onLoad:function(){
                        //$dialog.success("已成功导出");
                        $timeout(function(){
                            anchor.remove();
                        }, 2000);
                    }
                });
                angular.element("body").append(anchor);
            };

            return resource;
        };
    }]).factory("AppAPI", ["Resource", function(Resource){
        return Resource("/account/:id", { id:"@id" }, {
            getAccount : { method:"GET", url:"/account", isArray:false}
        });
    }]);
});

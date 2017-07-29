/**
 * Created by Jeng on 2016/1/28.
 */
define(function (require) {
    var angular = require('angular');
    return angular.module("App.REST",[
        "ngResource",
        "ui.bootstrap"
    ]).factory("AppAPI", ["uiaResource", function(Resource){
        return Resource("/account/:id", { id:"@id" }, {
            getAccount : { method:"GET", url:"/account", isArray:false}
        });
    }]).factory("AccountAPI", ["uiaResource", function(Resource){
        return Resource("/account/:id", { id:"@id" }, {
            getAccount : { method:"GET", url:"/account", isArray:false}
        });
    }]);
});

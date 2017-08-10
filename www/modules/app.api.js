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
            getAccount : { method:"GET", url:"/api/account", isArray:false},
            findPassword: {method:"PUT", url:"/api/find_password", params:{
                type:"@type",
                receiver:"@receiver",
                password:"@password",
                code:"@code",
            }},
            register: { method:"POST", url:"/api/register" }
        });
    }]).factory("AccountAPI", ["uiaResource", "Upload", function(Resource, Upload){
        var resource = Resource("/account/:id", { id:"@id" }, {
            getAccount : { method:"GET", url:"/api/account", isArray:false},
            resetPassword: {method:"PUT", url:"/api/account/password", params:{
                password:"@password",
                oldPassword:"@oldPassword"
            }},
            bindAccount: {method:"PUT", url:"/api/account/bind", params:{
                type:"@type",
                receiver:"@receiver",
                code:"@code"
            }}
        });
        resource.updateAvatar = function(data, success, error){
            data = data || {};
            return Upload.upload({
                // method:"PUT",
                url: "/api/account/avatar",
                data: data
            });
        };
        return resource;
    }]).factory("ValidationCodeAPI", ["uiaResource", function(Resource){
        return Resource("/code/:id", { id:"@id" }, {
            create : { method:"POST", isArray:false, params:{
                type:"@type",
                receiver:"@receiver",
            }}
        });
    }]);
});

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
            findPassword: {method:"PUT", url:ApiPrefix + "/access/find_password", params:{
                type:"@type",
                receiver:"@receiver",
                password:"@password",
                code:"@code",
            }},
            countNotification:{
                isArray:true,
                method:"GET",
                url: ApiPrefix + "/account/notification/count"
            },
            getNotification:{
                method:"GET",
                url: ApiPrefix + "/account/notification"
            },
            getNotificationDetail:{
                method:"GET",
                url: ApiPrefix + "/account/notification/:id",
                params:{
                    id:"@id"
                }
            },
            login: {
                method:"POST",
                url: ApiPrefix + "/login",
                headers : {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (data, headersGetter) {
                    var str = [];
                    for(var p in data){
                        if(p && data[p]){
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                        }
                    }
                    return str.join("&");
                }
            },
            logout: {url: ApiPrefix + "/logout"},
            register: { method:"POST", url:ApiPrefix + "/access/register" }
        });
    }]).factory("AccountAPI", ["uiaResource", "Upload", function(Resource, Upload){
        var resource = Resource("/account/:id", { id:"@id" }, {
            getAccount : { method:"GET", url:ApiPrefix + "/account", isArray:false},
            resetPassword: {method:"PUT", url:ApiPrefix + "/account/password", params:{
                password:"@password",
                oldPassword:"@oldPassword"
            }},
            bindAccount: {method:"PUT", url:ApiPrefix + "/account/bind", params:{
                type:"@type",
                receiver:"@receiver",
                code:"@code"
            }},
            getPermissions:{url:ApiPrefix + "/account/permissions"}
        });
        resource.updateAvatar = function(data, success, error){
            data = data || {};
            return Upload.upload({
                // method:"PUT",
                url: ApiPrefix + "/account/avatar",
                data: data
            });
        };
        return resource;
    }]).factory("ValidationCodeAPI", ["uiaResource", function(Resource){
        return Resource("/access/code/:id", { id:"@id" }, {
            create : { method:"POST", isArray:false, params:{
                type:"@type",
                receiver:"@receiver",
            }}
        });
    }]);
});

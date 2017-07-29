/**
 * Created by Jeng on 2016/1/28.
 */
define(function () {
    return angular.module("App.REST").factory("UserPermissionAPI", ["uiaResource", function(Resource){
        var resource = Resource("/user/permission/:id", { id:"@id" });
        resource.export = function(data, success, error){
            if(!data.url){
                data.url = "/user/permission/export";
            }
            resource.$export(data, success, error);
        };
        return resource;
    }]);
});

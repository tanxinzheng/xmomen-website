/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("GroupPermissionAPI", ["uiaResource", function(Resource){
    var resource = Resource("/group/permission/:id", { id:"@id" });
    resource.export = function(data, success, error){
        if(!data.url){
            data.url = "/api/group/permission/export";
        }
        resource.$export(data, success, error);
    };
    return resource;
}]);

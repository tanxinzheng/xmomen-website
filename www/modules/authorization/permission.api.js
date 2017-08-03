/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("PermissionAPI", ["uiaResource", "Upload", function(Resource, Upload){
    var resource = Resource("/permission/:id", { id:"@id" });
    resource.export = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/permission/export";
        }
        resource.$export(data, success, error);
    };
    resource.downloadTemplate = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/permission/template";
        }
        return resource.$export(data, success, error);
    };
    resource.import = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/permission/import";
        }
        return Upload.upload({
            url: data.url,
            data: data.data
        });
    };
    return resource;
}]);

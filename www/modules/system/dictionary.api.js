/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("DictionaryAPI", ["uiaResource", 'Upload', function(Resource, Upload){
    var resource = Resource("/dictionary/:id", { id:"@id" });
    resource.export = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/dictionary/export";
        }
        return resource.$export(data, success, error);
    };
    resource.downloadTemplate = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/dictionary/template";
        }
        return resource.$export(data, success, error);
    };
    resource.import = function(data, success, error){
        data = data || {};
        if(!data.url){
            data.url = "/api/dictionary/import";
        }
        return Upload.upload({
            url: data.url,
            data: data.data
        });
    };
    return resource;
}]);
/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("DictionaryAPI", ["uiaResource", function(Resource){
    var resource = Resource("/dictionary/:id", { id:"@id" });
    resource.export = function(data, success, error){
        if(!data.url){
            data.url = "/api/dictionary/export";
        }
        resource.$export(data, success, error);
    };
    return resource;
}]);
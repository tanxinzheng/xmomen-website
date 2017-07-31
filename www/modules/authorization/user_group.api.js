/**
 * Created by Jeng on 2016/1/28.
 */
// define(function () {
    angular.module("App.REST").factory("UserGroupAPI", ["uiaResource", function(Resource){
        var resource = Resource("/user/group/:id", { id:"@id" });
        resource.export = function(data, success, error){
            if(!data.url){
                data.url = "/user/group/export";
            }
            resource.$export(data, success, error);
        };
        return resource;
    }]);
// });

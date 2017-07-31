/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("PermissionAPI", ["Resource", function(Resource){
    return Resource("/permission/:id", { id:"@id" });
}]);

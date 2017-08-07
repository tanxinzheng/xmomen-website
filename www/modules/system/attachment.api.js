/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("AttachmentAPI", ["Resource", function(Resource){
    return Resource("/attachment/:id", { id:"@id" });
}]);

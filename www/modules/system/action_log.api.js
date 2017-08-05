/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("ActionLogAPI", ["Resource", function(Resource){
    return Resource("/action_log/:id", { id:"@id" });
}]);

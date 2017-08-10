/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("ScheduleTaskAPI", ["Resource", function(Resource){
    return Resource("/schedule/task/:jobName", { jobName:"@jobName" }, {
        update:{
            method:"PUT",
            url:"/api/schedule/task/:jobName",
            params: {
                jobName:"@jobName",
                action:"@action",
            }
        }
    });
}]);

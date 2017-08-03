/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("GroupAPI", ["uiaResource", function(Resource){
    var resource = Resource("/group/:id", { id:"@id" }, {
        getGroupPermission:{
            method:"GET",
            url: "/api/group/:groupId/permission",
            isArray:false,
            params:{groupId: "@groupId"}
        },
        createGroupPermission:{
            method:"POST",
            url: "/api/group/:groupId/permission",
            params:{groupId: "@groupId", permissionIds:"@permissionIds"},
            isArray:true
        }
    });
    resource.export = function(data, success, error){
        if(!data.url){
            data.url = "/api/group/export";
        }
        resource.$export(data, success, error);
    };
    return resource;
}]);
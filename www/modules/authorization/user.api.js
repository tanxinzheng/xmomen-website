/**
 * Created by Jeng on 2016/1/28.
 */
angular.module("App.REST").factory("UserAPI", ["uiaResource", function(Resource){
    var resource = Resource("/user/:id", { id:"@id" }, {
        getUserPermission:{
            method:"GET",
            url: "/api/user/:userId/permission",
            isArray:true,
            params:{userId: "@userId"}
        },
        // createUserPermission:{
        //     method:"POST",
        //     url: "/api/user/:userId/permission",
        //     params:{userId: "@userId", permissionIds:"@permissionIds"},
        //     isArray:true
        // },
        getUserGroup:{
            method:"GET",
            url: "/api/user/:userId/group",
            isArray:false,
            params:{userId: "@userId"}
        },
        createUserGroup:{
            method:"POST",
            url: "/api/user/:userId/group",
            params:{userId: "@userId", groupIds:"@groupIds"},
            isArray:true
        }
    });
    resource.export = function(data, success, error){
        if(!data.url){
            data.url = "/api/user/export";
        }
        resource.$export(data, success, error);
    };
    return resource;
}]);
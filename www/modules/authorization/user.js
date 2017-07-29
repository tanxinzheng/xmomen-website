/**
 * Created by tanxinzheng on 16/7/3.
 */
define([
    "modules/authorization/user_permission.api"
], function(){
    return ["$scope",  "UserAPI", "uiaDialog", "$injector", "$uibModal", function($scope, UserAPI, uiaDialog, $injector, $uibModal){
        $scope.gridOption = {
            id:"user",
            title:'用户',
            loadEvent: UserAPI.query,
            ApiService: UserAPI,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入用户名/姓名/邮箱/手机号码' }
            ],
//          js定义列字段
            columns:[
                { name:'username', title:'用户名' },
                { name:'nickname', title:'姓名' },
                { name:'email', title:'邮箱'},
                { name:'phoneNumber', title:'手机号码'},
                { name:'createdTime', title:'注册时间',  type:'date' },
                { name:'lastLoginTime', title:'最后登录时间', type:'date'},
                { name:'locked', title:'锁定', type:'checkbox'}
            ],
            boxOption : {
                ApiService: UserAPI,
                columns:[
                    { name:'username', title:'用户名', rules:{ required: true} },
                    { name:'nickname', title:'姓名', rules:{ required: true} },
                    { name:'password', title:'密码', rules:{ required: true}, show: function(item){
                        if(item.id){
                            return false;
                        }
                        return true;
                    }},
                    { name:'email', title:'邮箱', rules:{ required: true, email:true}},
                    { name:'phoneNumber', title:'手机号码', rules:{ required: true, telephone:true}},
                    { name:'locked', title:'锁定', type:'checkbox'}
                ]
            },
            buttons:[
                {
                    title:'绑定用户组',
                    click:function (item) {
                        $scope.viewUserPermission(item);
                    }
                }
            ]
        };
        // 用户权限
        $scope.viewUserPermission = function(item){
            var $uibModal;
            if(!$uibModal){
                $uibModal = $injector.get('$uibModal');
            }
            $uibModal.open({
                templateUrl: 'user_permission.html',
                modal:true,
                size:"lg",
                resolve: {
                    Params: function () {
                        var params = {};
                        if(item && item.id){
                            params.id = item.id;
                            params.name = item.nickname;
                        }
                        return params;
                    }
                },
                controller: ['$scope', '$uibModalInstance', "$uibModal", "UserAPI", "Params", function($scope, $uibModalInstance, $uibModal, UserAPI, Params){
                    $scope.queryParam = {};
                    // 查询可选资源
                    $scope.getNotHasResource = function(){
                        UserAPI.getUserPermission({
                            limit:10000,
                            offset:1,
                            keyword: $scope.queryParam.notHasResourceKeyword,
                            userId: Params.id,
                            hasPermission: false
                        }, function(data){
                            $scope.notHasResourceList = data.data;
                        });
                    };
                    // 查询已有权限
                    $scope.getHasResource = function(){
                        UserAPI.getUserPermission({
                            limit:10000,
                            offset:1,
                            keyword: $scope.queryParam.hasResourceKeyword,
                            userId: Params.id,
                            hasPermission: true
                        }, function(data){
                            $scope.hasResourceList = data.data;
                        });
                    };
                    // 选择待绑权限
                    $scope.choiceUnbind = function(index){
                        $scope.notHasResourceList[index].selected = !$scope.notHasResourceList[index].selected;
                    };
                    // 解绑权限
                    $scope.unbind = function(index){
                        var resource = $scope.hasResourceList[index];
                        UserPermissionAPI.delete({
                            userId: Params.id,
                            permissionIds:[resource.id]
                        }, function(data){
                            resource.selected = null;
                            resource.mouseenter = null;
                            $scope.hasResourceList.splice(index, 1);
                            $scope.notHasResourceList.push(resource);
                        });
                    };
                    $scope.unbindCheckAll = function(){
                        for (var i = 0; i < $scope.notHasResourceList.length; i++) {
                            var obj = $scope.notHasResourceList[i];
                            obj.selected = !obj.selected;
                        }
                    };
                    $scope.bindCheckAll = function(){
                        for (var i = 0; i < $scope.hasResourceList.length; i++) {
                            var obj = $scope.hasResourceList[i];
                            obj.selected = !obj.selected;
                        }
                    };
                    // 添加已选组权限
                    $scope.addChoiceBind = function(){
                        var ids = [];
                        var indexs = [];
                        for (var i = 0; i < $scope.notHasResourceList.length; i++) {
                            var obj = $scope.notHasResourceList[i];
                            if(obj.selected){
                                ids.push(obj.id);
                                indexs.push(i);
                            }
                        }
                        if(!ids || ids.length == 0){
                            $dialog.alert("请勾选需要添加的组权限资源");
                            return;
                        }
                        UserAPI.createUserPermission({
                            userId: Params.id,
                            permissionIds:ids
                        }, function(data){
                            if(data && data.length > 0){
                                for (var i = 0; i < indexs.length; i++) {
                                    var obj1 = $scope.notHasResourceList[indexs[i] - i];
                                    $scope.notHasResourceList.splice(indexs[i] - i, 1);
                                    obj1.selected = false;
                                    obj1.mouseenter = false;
                                    $scope.hasResourceList.push(obj1);
                                }
                            }
                        });
                    };
                    // 删除已选已有权限
                    $scope.removeChoiceBind = function(){
                        var ids = [];
                        var indexs = [];
                        for (var i = 0; i < $scope.hasResourceList.length; i++) {
                            var obj = $scope.hasResourceList[i];
                            if(obj.selected){
                                ids.push(obj.id);
                                indexs.push(i);
                            }
                        }
                        if(!ids || ids.length == 0){
                            $dialog.alert("请勾选需要删除的组权限资源");
                            return;
                        }
                        UserPermissionAPI.delete({
                            userId: Params.id,
                            permissionIds: ids
                        }, function(data){
                            for (var i = 0; i < indexs.length; i++) {
                                var obj1 = $scope.hasResourceList[indexs[i] - i];
                                $scope.hasResourceList.splice(indexs[i] - i, 1);
                                obj1.selected = false;
                                obj1.mouseenter = false;
                                $scope.notHasResourceList.push(obj1);
                            }
                        });
                    };
                    $scope.choiceBind = function(index){
                        $scope.hasResourceList[index].selected = !$scope.hasResourceList[index].selected;
                    };
                    $scope.bind = function(index){
                        var resource = $scope.notHasResourceList[index];
                        UserPermissionAPI.create({
                            userId: Params.id,
                            permissionId:resource.id
                        }, function(){
                            resource.selected = null;
                            $scope.notHasResourceList.splice(index, 1);
                            $scope.hasResourceList.push(resource);
                        })
                    };
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                    var init = function(){
                        if(Params && Params.id){
                            $scope.getHasResource();
                            $scope.getNotHasResource();
                        }
                        if(Params){
                            $scope.name = Params.name;
                        }
                    };
                    init();
                }]
            }).result.then(function () {
                $scope.getUserList();
            });
        };
        // 组权限
        $scope.viewUserGroup = function(index){
            var $uibModal;
            if(!$uibModal){
                $uibModal = $injector.get('$uibModal');
            }
            $uibModal.open({
                templateUrl: 'user_group.html',
                modal:true,
                size:"lg",
                resolve: {
                    Params: function () {
                        var params = {};
                        if($scope.userList[index] && $scope.userList[index].id){
                            params.id = $scope.userList[index].id;
                            params.name = $scope.userList[index].nickname;
                        }
                        return params;
                    }
                },
                controller: ['$scope', '$uibModalInstance', "$uibModal", "UserAPI", "UserGroupAPI", "Params", function($scope, $uibModalInstance, $uibModal, UserAPI, UserGroupAPI, Params){
                    $scope.queryParam = {};
                    // 查询可选资源
                    $scope.getNotHasResource = function(){
                        UserAPI.getUserGroup({
                            limit:10000,
                            offset:1,
                            keyword: $scope.queryParam.notHasResourceKeyword,
                            userId: Params.id,
                            hasGroup: false
                        }, function(data){
                            $scope.notHasResourceList = data.data;
                        });
                    };
                    // 查询已有权限
                    $scope.getHasResource = function(){
                        UserAPI.getUserGroup({
                            limit:10000,
                            offset:1,
                            keyword: $scope.queryParam.hasResourceKeyword,
                            userId: Params.id,
                            hasGroup: true
                        }, function(data){
                            $scope.hasResourceList = data.data;
                        });
                    };
                    // 选择待绑权限
                    $scope.choiceUnbind = function(index){
                        $scope.notHasResourceList[index].selected = !$scope.notHasResourceList[index].selected;
                    };
                    // 解绑权限
                    $scope.unbind = function(index){
                        var resource = $scope.hasResourceList[index];
                        UserGroupAPI.delete({
                            userId: Params.id,
                            groupIds:[resource.id]
                        }, function(data){
                            resource.selected = null;
                            resource.mouseenter = null;
                            $scope.hasResourceList.splice(index, 1);
                            $scope.notHasResourceList.push(resource);
                        });
                    };
                    $scope.unbindCheckAll = function(){
                        for (var i = 0; i < $scope.notHasResourceList.length; i++) {
                            var obj = $scope.notHasResourceList[i];
                            obj.selected = !obj.selected;
                        }
                    };
                    $scope.bindCheckAll = function(){
                        for (var i = 0; i < $scope.hasResourceList.length; i++) {
                            var obj = $scope.hasResourceList[i];
                            obj.selected = !obj.selected;
                        }
                    };
                    // 添加已选组权限
                    $scope.addChoiceBind = function(){
                        var ids = [];
                        var indexs = [];
                        for (var i = 0; i < $scope.notHasResourceList.length; i++) {
                            var obj = $scope.notHasResourceList[i];
                            if(obj.selected){
                                ids.push(obj.id);
                                indexs.push(i);
                            }
                        }
                        if(!ids || ids.length == 0){
                            $dialog.alert("请勾选需要添加的组权限资源");
                            return;
                        }
                        UserAPI.createUserGroup({
                            userId: Params.id,
                            groupIds:ids
                        }, function(data){
                            if(data && data.length > 0){
                                for (var i = 0; i < indexs.length; i++) {
                                    var obj1 = $scope.notHasResourceList[indexs[i] - i];
                                    $scope.notHasResourceList.splice(indexs[i] - i, 1);
                                    obj1.selected = false;
                                    obj1.mouseenter = false;
                                    $scope.hasResourceList.push(obj1);
                                }
                            }
                        });
                    };
                    // 删除已选已有权限
                    $scope.removeChoiceBind = function(){
                        var ids = [];
                        var indexs = [];
                        for (var i = 0; i < $scope.hasResourceList.length; i++) {
                            var obj = $scope.hasResourceList[i];
                            if(obj.selected){
                                ids.push(obj.id);
                                indexs.push(i);
                            }
                        }
                        if(!ids || ids.length == 0){
                            $dialog.alert("请勾选需要删除的组权限资源");
                            return;
                        }
                        UserGroupAPI.delete({
                            userId: Params.id,
                            groupIds: ids
                        }, function(data){
                            for (var i = 0; i < indexs.length; i++) {
                                var obj1 = $scope.hasResourceList[indexs[i] - i];
                                $scope.hasResourceList.splice(indexs[i] - i, 1);
                                obj1.selected = false;
                                obj1.mouseenter = false;
                                $scope.notHasResourceList.push(obj1);
                            }
                        });
                    };
                    $scope.choiceBind = function(index){
                        $scope.hasResourceList[index].selected = !$scope.hasResourceList[index].selected;
                    };
                    $scope.bind = function(index){
                        var resource = $scope.notHasResourceList[index];
                        UserGroupAPI.create({
                            userId: Params.id,
                            groupId:resource.id
                        }, function(){
                            resource.selected = null;
                            $scope.notHasResourceList.splice(index, 1);
                            $scope.hasResourceList.push(resource);
                        })
                    };
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                    var init = function(){
                        if(Params && Params.id){
                            $scope.getHasResource();
                            $scope.getNotHasResource();
                        }
                        if(Params){
                            $scope.name = Params.name;
                        }
                    };
                    init();
                }]
            }).result.then(function () {
                $scope.getUserList();
            });
        };
    }]
});
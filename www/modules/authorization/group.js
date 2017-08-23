/**
 * Created by tanxinzheng on 16/7/3.
 */
define(function(){
    return ["$scope", "$uibModal", "GroupAPI", "uiaDialog", function($scope, $uibModal, GroupAPI, $dialog){
        $scope.gridOption = {
            id:"user",
            title:'用户组',
            loadEvent: GroupAPI.query,
            ApiService: GroupAPI,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入用户名/姓名/邮箱/手机号码' }
            ],
//          js定义列字段
            columns:[
                { name:'groupCode', title:'用户组代码' },
                { name:'groupName', title:'用户组名称' },
                { name:'description', title:'用户组描述'},
                { name:'active', title:'激活', type:'checkbox'}
            ],
            boxOption : {
                ApiService: GroupAPI,
                columns:[
                    { name:'groupCode', title:'用户组代码' },
                    { name:'groupName', title:'用户组名称' },
                    { name:'description', title:'用户组描述'},
                    { name:'active', title:'激活', type:'checkbox'}
                ]
            },
            buttons:{
                relationBtn:{
                    click: function(event, item){
                        $scope.viewGroupPermission(item);
                    }
                }
            },
            buttons:[
                {
                    title:'组权限',
                    click:function (event, item) {
                        $scope.viewGroupPermission(item);
                    }
                }
            ]
        };
        // 组权限
        $scope.viewGroupPermission = function(item){
            $uibModal.open({
                templateUrl: 'group_permission.html',
                modal:true,
                size:"lg",
                resolve: {
                    Params: function () {
                        var params = {};
                        if(item && item.id){
                            params.id = item.id;
                            params.name = item.groupName;
                        }
                        return params;
                    }
                },
                controller: ['$scope', '$uibModalInstance', "$uibModal", "GroupAPI", "GroupPermissionAPI", "Params", function($scope, $uibModalInstance, $uibModal, GroupAPI, GroupPermissionAPI, Params){
                    $scope.queryParam = {};
                    // 查询可选资源
                    $scope.getNotHasResource = function(){
                        GroupAPI.getGroupPermission({
                            pageSize:10000,
                            pageNum:1,
                            keyword: $scope.queryParam.notHasResourceKeyword,
                            groupId: Params.id,
                            hasBindPermission: false
                        }, function(data){
                            $scope.notHasResourceList = data.data;
                        });
                    };
                    // 查询已有权限
                    $scope.getHasResource = function(){
                        GroupAPI.getGroupPermission({
                            pageSize:10000,
                            pageNum:1,
                            keyword: $scope.queryParam.hasResourceKeyword,
                            groupId: Params.id,
                            hasBindPermission: true
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
                        GroupPermissionAPI.delete({
                            groupId: Params.id,
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
                        GroupAPI.createGroupPermission({
                            groupId: Params.id,
                            permissionIds:ids
                        }, function(data){
                            for (var i = 0; i < indexs.length; i++) {
                                var obj1 = $scope.notHasResourceList[indexs[i] - i];
                                $scope.notHasResourceList.splice(indexs[i] - i, 1);
                                obj1.selected = false;
                                obj1.mouseenter = false;
                                $scope.hasResourceList.push(obj1);
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
                        GroupPermissionAPI.delete({}, {
                            groupId: Params.id,
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
                        GroupPermissionAPI.create({
                            groupId: Params.id,
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
                $scope.gridOption.search();
            });
        };
    }]
});
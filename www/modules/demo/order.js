/**
 * Created by tanxinzheng on 16/7/3.
 */
define(function(){
    return ["$scope", "$modal", "OrderAPI", "$dialog", function($scope, $modal, OrderAPI, $dialog){
        $scope.pageSetting = {
            checkAll : false,
            queryBtnLoading : false
        };
        $scope.pageInfoSetting = {
            pageSize:10,
            pageNum:1
        };
        // 重置
        $scope.reset = function(){
            $scope.queryParam={};
            $scope.getOrderList();
        };
        $scope.queryParam = {};
        // 查询列表
        $scope.getOrderList = function(){
            $scope.pageSetting.queryBtnLoading = true;
            OrderAPI.query({
                keyword: $scope.queryParam.keyword,
                limit: $scope.pageInfoSetting.pageSize,
                offset: $scope.pageInfoSetting.pageNum
            }, function(data){
                $scope.orderList = data.data;
                $scope.pageInfoSetting = data.pageInfo;
            }).$promise.finally(function(){
                $scope.pageSetting.queryBtnLoading = false;
            });;
        };
        // 全选
        $scope.checkAll = function(){
            if(!$scope.orderList){
                return;
            }
            for (var i = 0; i < $scope.orderList.length; i++) {
                $scope.orderList[i].checked = $scope.pageSetting.checkAll;
            }
        };
        // 子集控制全选
        $scope.changeItemChecked = function(){
            if(!$scope.orderList){
                return;
            }
            var num = 0;
            for (var i = 0; i < $scope.orderList.length; i++) {
                if($scope.orderList[i].checked){
                    num++;
                }
            }
            // 子集勾选数量等于集合总数则勾选全选，否则取消全选
            if(num == $scope.orderList.length){
                $scope.pageSetting.checkAll = true;
            }else{
                $scope.pageSetting.checkAll = false;
            }
        };
        // 新增
        $scope.add = function(index){
            $scope.openModal("ADD", index);
        };
        // 查看
        $scope.view = function(index){
            $scope.openModal("VIEW", index);
        };
        // 修改
        $scope.update = function(index){
            $scope.openModal("UPDATE", index);
        };
        // 弹出
        $scope.openModal = function(action, index){
            $modal.open({
                templateUrl: 'order_detail.html',
                modal:true,
                resolve: {
                    Params: function () {
                        var params = {
                            action: action
                        };
                        if(index >= 0 && $scope.orderList[index] && $scope.orderList[index].id){
                            params.id = $scope.orderList[index].id;
                        }
                        return params;
                    }
                },
                controller: ['$scope', '$modalInstance', "$modal", "OrderAPI", "Params", "$dialog", function($scope, $modalInstance, $modal, OrderAPI, Params, $dialog){
                    //$scope.order = null;
                    $scope.pageSetting = {
                        formDisabled : true,
                        saveBtnLoading : false
                    };
                    if(Params.action == "UPDATE" || Params.action == "ADD"){
                        $scope.pageSetting.formDisabled = false;
                    }
                    if(Params && Params.id){
                        $scope.order = OrderAPI.get({
                            id: Params.id
                        });
                    }
                    $scope.orderDetailForm = {};
                    $scope.saveOrder = function(){
                        if($scope.orderDetailForm.validator.form()){
                            $dialog.confirm("是否保存数据？").then(function(){
                                $scope.pageSetting.saveBtnLoading = true;
                                if ( !$scope.order.id ) {
                                    OrderAPI.create($scope.order, function(data,headers){
                                        $dialog.success("新增成功");
                                        $modalInstance.close();
                                    }).$promise.finally(function(){
                                        $scope.pageSetting.saveBtnLoading = false;
                                    });
                                }else {
                                    OrderAPI.update($scope.order, function(data,headers){
                                        $dialog.success("更新成功");
                                        $modalInstance.close();
                                    }).$promise.finally(function(){
                                        $scope.pageSetting.saveBtnLoading = false;
                                    });
                                }
                            });
                        }
                    };
                    $scope.cancel = function(){
                        $modalInstance.dismiss();
                    };
                }]
            }).result.then(function () {
                $scope.getOrderList();
            });
        };
        // 删除
        $scope.delete = function(index){
            $dialog.confirm("请确认是否删除").then(function(){
                OrderAPI.delete({id:$scope.orderList[index].id}, function(){
                    $scope.getOrderList();
                });
            });
        };
        // 批量删除
        $scope.batchDelete = function(){
            var choiceItems = [];
            for (var i = 0; i < $scope.orderList.length; i++) {
                var obj = $scope.orderList[i];
                if(obj.checked){
                    choiceItems.push(obj.id);
                }
            }
            if(choiceItems && choiceItems.length > 0){
                $dialog.confirm("已勾选记录数：" + choiceItems.length + "，请确认是否删除已勾选数据").then(function(){
                    OrderAPI.delete({ids:choiceItems}, function(){
                        $scope.getOrderList();
                    });
                })
            }else{
                $dialog.alert("请勾选需要删除的数据");
            }
        };
        // 导出
        $scope.batchExport = function(){
            OrderAPI.export({
                data:{keyword: $scope.queryParam.keyword}
            });
        };
        var init = function(){
            $scope.getOrderList();
        };
        init();
    }]
});
/**
 * Created by tanxinzheng on 16/7/3.
 */
define(function(){
    return ["$scope", "$uibModal", "DictionaryAPI", "uiaDialog", function($scope, $uibModal, DictionaryAPI, uiaDialog){
        $scope.gridOption = {
            title:'数据字典',
            loadEvent: DictionaryAPI.query,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键词', placeholder:'请输入关键字进行模糊查询' }
            ],
//          js定义列字段
            columns:[
                { name:'groupCode', title:'字典类型' },
                { name:'groupName', title:'类型描述' },
                { name:'dictionaryName', title:'字典名称'},
                { name:'dictionaryCode', title:'字典代码'},
                { name:'sort', title:'排序'},
                { name:'active', title:'激活', type:'checkbox',
                    checked: function(data){
                        return data.active == 1 ? true:false;
                    }
                },
                { name:'show', title:'显示', type:'checkbox',
                    checked: function(data){
                        return data.show == 1 ? true:false;
                    }
                },
                { name:'createdTime', title:'创建时间', type:'date' }
            ],
            addBtn:{
                permission:"PROJECT:DOCUMENT:NEW",
                handlerParam:function(item){
                    return {
                        action:'add'
                    };
                },
                link:'/form'
            },
            viewBtn:{
                permission:"PROJECT:DOCUMENT:VIEW",
                handlerParam:function(item){
                    return {
                        projectNa:item.projectNa
                    };
                },
                link:'/form'
            },
            removeBtn:{
                permission:"PROJECT:DOCUMENT:DELETE",
                click: function(item){
                    uiaDialog.confirm('是否删除该数据？').then(function(){
                        uiaDialog.alert("删除成功");
                    });
                }
            }
        };
        // 新增
        $scope.add = function(index){
            $scope.openModal(index, "ADD");
        };
        // 查看
        $scope.view = function(index){
            $scope.openModal(index, "VIEW");
        };
        // 修改
        $scope.update = function(index){
            $scope.openModal(index, "UPDATE");
        };
        // 弹出
        $scope.openModal = function(index, action){
            $uibModal.open({
                templateUrl: 'dictionary_detail.html',
                modal:true,
                resolve: {
                    Params: function () {
                        var params = {
                            action: action
                        };
                        if($scope.dictionaryList[index] && $scope.dictionaryList[index].id){
                            params.id = $scope.dictionaryList[index].id;
                        }
                        return params;
                    }
                },
                controller: ['$scope', '$uibModalInstance', "$uibModal", "DictionaryAPI", "Params", "uiaDialog", "DictionaryGroupAPI", function($scope, $uibModalInstance, $uibModal, DictionaryAPI, Params, $dialog, DictionaryGroupAPI){
                    //$scope.dictionary = null;
                    $scope.pageSetting = {
                        formDisabled : true,
                        saveBtnLoading : false
                    };
                    if(Params.action == "UPDATE" || Params.action == "ADD"){
                        $scope.pageSetting.formDisabled = false;
                    }
                    if(Params && Params.id){
                        $scope.dictionary = DictionaryAPI.get({
                            id: Params.id
                        });
                    }
                    $scope.dictionaryGroupSelect = {};
                    $scope.$watch("dictionaryGroupSelect.selected", function(newVal, oldVal){
                        if(newVal != oldVal){
                            $scope.dictionary.dictionaryType = newVal.dictionaryType;
                        }
                    });
                    $scope.saveDictionary = function(){
                        if($scope.dictionaryDetailFormName.validate()){
                            $dialog.confirm("是否保存数据？").then(function(){
                                $scope.pageSetting.saveBtnLoading = true;
                                if ( !$scope.dictionary.id ) {
                                    DictionaryAPI.create($scope.dictionary, function(data,headers){
                                        $dialog.success("新增成功");
                                        $uibModalInstance.close();
                                    }).$promise.finally(function(){
                                        $scope.pageSetting.saveBtnLoading = false;
                                    });
                                }else {
                                    DictionaryAPI.update($scope.dictionary, function(data,headers){
                                        $dialog.success("更新成功");
                                        $uibModalInstance.close();
                                    }).$promise.finally(function(){
                                        $scope.pageSetting.saveBtnLoading = false;
                                    });
                                }
                            });
                        }
                    };
                    $scope.dictionaryGroup = [];
                    $scope.queryDictionaryGroup = function(){
                        DictionaryGroupAPI.query({
                            offset:1,
                            limit:10000
                        }, function(data){
                            $scope.dictionaryGroup = data.data;
                        });
                    };
                    $scope.addDictionaryGroup = function(){

                    };
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                    var init = function(){
                        $scope.dictionary = {};
                        $scope.queryDictionaryGroup();
                    };
                    init();
                }]
            }).result.then(function () {
                $scope.getDictionaryList();
            });
        };
        // 导出
        $scope.batchExport = function(){
            DictionaryAPI.export({
                data:{keyword: $scope.queryParam.keyword}
            });
        };
        var init = function(){
            //$scope.getDictionaryList();
        };
        init();
    }]
});
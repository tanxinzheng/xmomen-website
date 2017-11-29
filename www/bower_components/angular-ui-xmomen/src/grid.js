/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').directive('htmlBind', function($compile, $parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watch(attr.content, function() {
                element.html($parse(attr.content)(scope));
                $compile(element.contents())(scope);
            }, true);
        }
    }
}).provider('UiaGridConfig', [function(){
     this.globalTemplateUrl = 'uia/template/grid.html';
     this.$get = [function(){
         return {
             globalTemplateUrl:this.globalTemplateUrl
         }
     }];
}]).controller('UiaGridController', ['$scope', '$filter', 'uiaDialog', '$uibModal', function ($scope, $filter, $dialog, $uibModal) {
    var defaultOption = {
        showSearchBtn:true,
        showResetBtn:true,
        showRemoveBtn:true,
        showViewBtn:true,
        showAddBtn:true,
        showFileBtn:false
    };
    $scope.gridOption = angular.extend(defaultOption, $scope.gridOption);
    $scope.queryParams = {};
    $scope.gridOption.pageInfo = {
        pageSize:10,
        pageNum:1
    };
    $scope.$watch('queryParams', function(){
        $scope.gridOption.pageInfo.pageNum = 1;
    }, true);
    $scope.search = function(){
        $scope.gridSetting.checkAll = false;

        $scope.gridOption.queryParams = $scope.queryParams;
        var params = angular.copy($scope.gridOption.queryParams) || {};
        if(!$scope.gridOption.pageInfo){
            $scope.gridOption.pageInfo = {
                pageSize:10,
                pageNum:1
            }
        }
        params.pageSize = $scope.gridOption.pageInfo.pageSize;
        params.pageNum = $scope.gridOption.pageInfo.pageNum;
        params.sorts = $scope.queryParams.sorts;
        angular.forEach(params, function(val, key){
            if(key == 'undefined' || key == 'null' || val == ''){
                delete params[key];
            }
        });
        $scope.pageSetting.loading=true;
        var instance = $scope.gridOption.loadEvent(params);
        var promise;
        if(instance.$promise){
            promise = instance.$promise;
        }else if(instance.then && angular.isFunction(instance.then)){
            promise = instance;
        }

        promise.then(function(data){
            $scope.gridOption.data = data.data;
            $scope.gridOption.pageInfo = data.pageInfo;
        }).finally(function(){
            $scope.pageSetting.loading=false;
        });
    };
    // 设置filters属性默认值
    var initFilters = function(filters){
        angular.forEach(filters, function(val, key){
            if(!filters[key].placeholder){
                filters[key].placeholder = '请输入' + filters[key].title;
            }
            if(val.type == 'select' && val.disableSearch == undefined){
                val.disableSearch = true;
            }
        });
    };
    var initColumns = function(columns){
        angular.forEach(columns, function(val, key){
            if(!val.type){
                val.type = 'text';
            }
            if(val.type == 'checkbox' && val.checked == undefined){
                val.checked = function(item){
                    if(item[val['name']]){
                        return true;
                    }
                    return false;
                }
            }
        });
    };
    $scope.formatterValue = function(val, column){
        switch (column.type){
            case "text":
                if(column.formatter){
                    return $filter(column.formatter)(val);
                }
                return val;
                break;
            // 日期
            case "date":
                if(!column.formatter){
                    return $filter('date')(val, 'yyyy-MM-dd hh:mm:ss');
                }
                return $filter('date')(val, column.formatter);
                break;
            // 常用币种
            case "currency":
                if(!column.formatter){
                    return $filter('currency')(val, '');
                }
                return $filter('currency')(val, column.formatter);
                break;
            // 万元
            case "million":
                if(!column.formatter){
                    return $filter('currency')(val, '', 4);
                }
                return $filter('currency')(val, column.formatter, 4);
                break;
            case "number":
                var fractionSize = 2;
                if(column.fractionSize){
                    fractionSize = column.fractionSize;
                }
                return $filter('number')(val, fractionSize);
                break;
            default :
                return val;
        }
    };
    $scope.currentChoiceItems = [];
    $scope.gridSetting = {};
    // 全选
    $scope.checkAll = function(){
        if(!$scope.gridOption.data){
            return;
        }
        for (var i = 0; i < $scope.gridOption.data.length; i++) {
            $scope.gridOption.data[i].checked = $scope.gridSetting.checkAll;
        }
    };
    // 子集控制全选
    $scope.changeItemChecked = function(){
        if(!$scope.gridOption.data){
            return;
        }
        var num = 0;
        for (var i = 0; i < $scope.gridOption.data.length; i++) {
            if($scope.gridOption.data[i].checked){
                num++;
            }
        }
        // 子集勾选数量等于集合总数则勾选全选，否则取消全选
        if(num == $scope.gridOption.data.length){
            $scope.gridSetting.checkAll = true;
        }else{
            $scope.gridSetting.checkAll = false;
        }
    };
    $scope.iconsort = false;
    $scope.sort = function(name){
        if(!name){
            return;
        }
        $scope.iconsort = name;
        if($scope.sortway){
            $scope.sortway = false;
            $scope.queryParams.sorts = name;
        }else{
            $scope.sortway = true;
            $scope.queryParams.sorts = "-" + name;
        }
        $scope.search();
    };
    $scope.filterOpen = true;
    $scope.openFilter = function(){
        $scope.filterOpen = !$scope.filterOpen;
    };
    $scope.removeEvent = function(){
        var ids = [];
        var checkedData = [];
        angular.forEach($scope.gridOption.data, function(val, index){
            if(val.checked){
                ids.push(val.id);
                checkedData.push(val);
            }
        });
        if(checkedData.length == 0){
            $dialog.alert('请选择数据');
            return;
        }
        if($scope.gridOption.removeBtn && angular.isFunction($scope.gridOption.removeBtn.click)){
            $scope.gridOption.removeBtn.click(checkedData);
            return;
        }
        $dialog.confirm('请确认是否删除？').then(function () {
            $scope.gridOption.ApiService.remove({
                ids: ids
            }, {
                ids: ids
            }, function(){
                $dialog.alert("删除成功");
                $scope.search();
            })
        })
    };
    $scope.viewEvent = function(item){
        if(!item && !$scope.currentChoiceItem){
            $dialog.alert("请选择数据");
            return;
        }
        if(item){
            $scope.currentChoiceItem = item;
        }
        $scope.viewModal(angular.copy($scope.currentChoiceItem));
    };
    $scope.viewModal = function(item, action){
        $uibModal.open({
            templateUrl: "box.modal.html",
            resolve:{
                Item: function(){
                    return item;
                },
                BoxOption: function(){
                    $scope.gridOption.boxOption.title = $scope.gridOption.title;
                    $scope.gridOption.boxOption.ApiService = $scope.gridOption.ApiService;
                    if(action == 'ADD'){
                        $scope.gridOption.boxOption.params = {
                            action:'ADD'
                        };
                    }
                    return $scope.gridOption.boxOption;
                }
            },
            controller:['$scope', 'Item', 'BoxOption', 'uiaDialog', '$uibModalInstance',
                function($scope, item, BoxOption, uiaDialog, $uibModalInstance){
                    $scope.boxOption = BoxOption;
                    $scope.boxOption.cancelBtn = {
                        click:function(){
                            $scope.cancel();
                        }
                    };
                    $scope.boxOption.saveBtn = {
                        callback:function(){
                            uiaDialog.alert('数据更新成功');
                            $uibModalInstance.close();
                        }
                    }
                    if(item != null){
                        $scope.boxOption.formData = item;
                    }
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                }]
        }).result.then(function(){
            $scope.search();
        });
    };
    // 新增
    $scope.addEvent = function(){
        if($scope.gridOption.viewBtn && $scope.gridOption.viewBtn.click && angular.isFunction($scope.gridOption.viewBtn.click)){
            $scope.gridOption.viewBtn.click();
            return;
        }
        $scope.viewModal({}, 'ADD');
    };
    //双击
    $scope.dbcEvent = function(item){
        $scope.currentChoiceItem = item;
        $scope.viewEvent($scope.currentChoiceItem);
    };
    // 重置
    $scope.reset = function(){
        if($scope.backup && $scope.backup.queryParams){
            $scope.queryParams=angular.copy($scope.backup.queryParams);
        }else{
            $scope.queryParams = {};
        }
        $scope.search();
    };
    // 导出
    $scope.exportEvent = function(){
        if($scope.gridOption.exportBtn && angular.isFunction($scope.gridOption.exportBtn.click)){
            $scope.gridOption.exportBtn.click();
            return;
        }
        $scope.gridOption.ApiService.export($scope.queryParams).then(function(){
            $dialog.alert('Excel导出成功');
        });
    };
    // 导入
    $scope.importSetting = {
        loading: false
    };
    $scope.importEvent = function(file){
        if(!file){
            return;
        }
        if($scope.gridOption.importBtn && angular.isFunction($scope.gridOption.importBtn.click)){
            $scope.gridOption.importBtn.click(file);
        }
        $scope.importSetting.loading = true;
        $scope.gridOption.ApiService.import({
            data: {
                file:file
            }
        }).then(function (resp) {
            $dialog.alert('Excel导入成功');
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            $dialog.alert('Excel导入失败');
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            $scope.importSetting.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + $scope.importSetting.progressPercentage + '% ' + evt.config.data.file.name);
            if($scope.importSetting.progressPercentage == 100 && $scope.importSetting.loading){
                $scope.importSetting.progressPercentage = 98;
            }
        }).finally(function(data){
            $scope.importSetting.progressPercentage = 100;
            $scope.importSetting.loading = false;

            $scope.search();
        });
    };
    // 下载模板
    $scope.downloadTemplate = function(){
        if(!$scope.gridOption.ApiService.downloadTemplate){
            throw new Error('The Resource don\'t has downloadTemplate function.');
        }
        $scope.gridOption.ApiService.downloadTemplate().then(function(){
            $dialog.alert('Excel模板下载成功');
        });
    }
    var init = function(){
        $scope.pageSetting={
            loading:false
        }
        initColumns($scope.gridOption.columns);
        initFilters($scope.gridOption.filters);
        if($scope.gridOption.queryParams){
            $scope.queryParams = $scope.gridOption.queryParams;
        }
        $scope.search();
        $scope.gridOption.refresh=$scope.search;
    };
    init();
}]).directive('uiaGrid', ['UiaGridConfig', function (UiaGridConfig) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true, //嵌入
        scope: {
            gridOption: "="
        },
        link:function(scope, element, attr, ctrl){
            if(!attr.gridOption){
                throw new Error('the "uia-grid" directive must be define "grid-option"');
            }
        },
        templateUrl: function($element, $attr){
            return $attr.templateUrl || UiaGridConfig.globalTemplateUrl || 'uia/template/grid.html';
        },
        controller:"UiaGridController"
    };
}]);

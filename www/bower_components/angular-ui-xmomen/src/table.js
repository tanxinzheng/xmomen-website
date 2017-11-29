/**
 * Created by TANXINZHENG481 on 2017-06-09.
 */
angular.module('uia').directive('uiaTable',['$compile', function($compile){
    return {
        restrict: 'A',
        scope: {
            uiaTableOption:"=",
            loadEvent:"=",
            loadParams:"=",
            tableResultData:"="
        },
        link:function(scope, elem, attr, ctrl){
            scope.uiaTableOption = angular.extend({
                pageInfo:{
                    pageSize:10,
                    pageNum:1
                }
            }, scope.uiaTableOption);
            scope.uiaTableOption.load = function(){
                scope.uiaTableOption.loadParams = scope.loadParams;
                var params = angular.copy(scope.uiaTableOption.loadParams) || {};
                params.pageSize = scope.uiaTableOption.pageInfo.pageSize;
                params.pageNum = scope.uiaTableOption.pageInfo.pageNum;
                var instance = scope.uiaTableOption.loadEvent(params);
                var promise;
                if(instance.$promise){
                    promise = instance.$promise;
                }else if(instance.then && angular.isFunction(instance.then)){
                    promise = instance;
                }
                promise.then(function(data){
                    scope.uiaTableOption.data = data.data;
                    scope.uiaTableOption.pageInfo = data.pageInfo;
                    scope.tableResultData = scope.uiaTableOption.data;
                    if(scope.uiaTableOption.success && angular.isFunction(scope.uiaTableOption.success)){
                        scope.uiaTableOption.success(data);
                    }
                });
            };
            var html = $compile('<uia-pagination page-info="uiaTableOption.pageInfo" load-parameter="uiaTableOption.queryParam" load-event="uiaTableOption.load()"></uia-pagination>')(scope);
            angular.element(elem).parent().parent().parent().append(html);
            scope.uiaTableOption.loadParams = scope.uiaTableOption.loadParams || {};
            scope.uiaTableOption.load();
        }
    }
}]);
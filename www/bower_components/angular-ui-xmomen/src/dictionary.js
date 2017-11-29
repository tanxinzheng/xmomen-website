/**
 * Created by TANXINZHENG481 on 2017-06-13.
 */
angular.module('uia').factory("SelectAPI",["uiaResource",function(Resource){
    return Resource("/select/cache/:id", { id:"@id" }, {
        query:{ isArray:true, method:"GET"}
    });
}]).directive("uiaSelect", ["SelectAPI", '$compile', '$timeout', function(SelectAPI, $compile, $timeout){
    return {
        restrict: 'A',
//        transclude : true, //嵌入
        scope: {
            dictCode: "=",
            dictParentCode: "=",
            dictSource: "=",
            ngModel : "="
        },
        require: ['?ngModel', 'select'],
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || '/template/dictionary.html';
        },
        link: function(scope, elem, attrs, ctrls){
            scope.isChange = false;
            if(angular.isUndefined(attrs.dictCode)){
                throw new Error("directive dict must be define 'dict-code'.");
            }else{
                scope.dictCode = scope.dictCode || attrs.dictCode;
            }
            if(angular.isDefined(attrs.dictParentCode)){
                scope.$watch("dictParentCode", function(newVal , oldVal){
                    if(newVal != oldVal){
                        if(!newVal){
                            scope.dictInfoList = [];
                            scope.ngModel = null;
                        }else{
                            getDictInfoList();
                        }
                    }
                });
            }
            if(angular.isDefined(attrs.dictSource)){
                scope.dictSource =  attrs.dictSource;
            }
            scope.$watch("ngModel", function(newVal , oldVal){
                if(newVal == null){
                    scope.ngModel = null;
                }
                if(newVal != oldVal){
                    angular.forEach(scope.dictInfoList, function(value , index){
                        var code = scope.ngModel;
                        if(value.dictCode == code){
                            scope.dictInfoList[index].selected = true;
                        }
                    });
                }
            });
            var getDictInfoList = function(){
                scope.dictInfoList = [];
                SelectAPI.query({
                    parentCode:  scope.dictParentCode,
                    dictSource: scope.dictSource,
                    typeCode : scope.dictCode
                }).$promise.then(function(data){
                    scope.dictInfoList = data;
                    var change = true;
                    angular.forEach(scope.dictInfoList, function(value , index){
                        var code = scope.ngModel;
                        if(value.code == code){
                            scope.dictInfoList[index].selected = true;
                            change = false;
                        }
                    });
                    if(change){
                        scope.ngModel = null;
                    }
                });
            };
            if(!angular.isDefined(attrs.dictParentCode) || (angular.isDefined(attrs.dictParentCode) && scope.dictParentCode) ){
                getDictInfoList();
            }
        }
    }
}]);
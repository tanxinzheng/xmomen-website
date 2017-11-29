/**
* Created by EX-WUPENGPENG001 on 2017-05-02.
*/
angular.module('uia').factory("ChoiceWidgetTemplateStore",[function(){
    var templates = {};
    return {
        defineManyTemplate : function(data){
            data.forEach(data, function(val, key){
                if(templates[key]){
                    throw new Error('The choiceWidgetType name "' + key + '" choice-widget exist in templates, please change the key name');
                }
                templates[key] = val;
            });
        },
        defineTemplate : function(key, data){
            if(templates[key]){
                throw new Error('The choiceWidgetType name "' + key + '" choice-widget exist in templates, please change the key name');
            }
            templates[key] = data;
        },
        getTemplate: function(key){
            if(!templates[key]){
                throw new Error('The choiceWidgetType name "' + key + '" choice-widget not exist in templates');
            }
            return templates[key];
        }
    }
}]).directive("uiaChoice",["$compile", "ChoiceWidgetTemplateStore","uiaDialog", "$timeout", "$filter", function($compile, ChoiceWidgetTemplateStore, $dialog, $timeout, $filter){
    return {
        restrict:'A',
        transclude: true,
        require: "ngModel",
        scope:{
            choiceOption:"=?",
            ngModel:"=",
            choiceChange:"&?",
            choiceModelLabel:"=",
            choiceValueKey:"@?",
            choiceLabelKey:"@?",
            // 模板类型
            choiceWidgetType:"@",
            // 父级约束
            parentConstraint:'=?'
        },
        //templateUrl : '',
        link:function(scope, element, attr, ngModel){
            //link里面的方法会在controller之后执行
//            if(!angular.element(element).parent().children('choice-widget-tpl').length){
//                angular.element(element).parent().append($compile("<choice-widget-tpl></choice-widget-tpl>")(scope));
//            }
            angular.element(element).attr('readonly', true);
            element.on('click', function(val){
                scope.openInfoList();
            });
            ngModel.$formatters.push(function(modelValue){
                if(scope.choiceModelLabel) {
                    $timeout(function(){
                        element.val(scope.choiceModelLabel);
                    });
                }
                return modelValue;
            });
            //ngModel.$viewChangeListeners.push(function() {
            //    $scope.ngModel = ngModel.$modelValue;
            //});
            //ngModel.$render(function(isUpdate){
            //    ngModel.$viewValue = currencyValue;
            //})
        },
        controller : ["$scope", "$attrs", "$element", "$uibModal", "uiaDialog",
        function($scope, $attrs, $element, $modal, $dialog){
            $scope.openInfoList = function(){
                $scope.choiceOption = angular.extend({}, $scope.choiceOption);
                if($attrs.choiceWidgetType){
                    $scope.choiceOption.choiceWidgetType = $attrs.choiceWidgetType;
                }
                if(!$scope.choiceOption.choiceWidgetType){
                    $dialog.alert("if you want to matching code, your widget-choice-type must be true.");
                }else{
                    var templateConfig = ChoiceWidgetTemplateStore.getTemplate($scope.choiceOption.choiceWidgetType);
                    if($attrs.choiceValueKey){
                        $scope.choiceOption.choiceValueKey = $scope.choiceValueKey;
                    }
                    if($attrs.parentConstraint){
                        $scope.choiceOption.parentConstraint = $scope.parentConstraint;
                    }
                    if($attrs.choiceLabelKey){
                        $scope.choiceOption.choiceLabelKey= $scope.choiceLabelKey;
                    }
                    $scope.choiceOption = angular.extend($scope.choiceOption, templateConfig);
                }
                $modal.open({
                    templateUrl: '/template/choice.html',
                    windowClass:'widget-choice',
                    resolve:{
                        option:function(){
                            if($scope.choiceOption){
                                return $scope.choiceOption
                            }else{
                                return null;
                            }
                        }
                    },
                    controller:["$scope","$uibModalInstance","option", "$filter",
                        function($scope,$modalInstance,option, $filter){
                            $scope.option=angular.extend({}, angular.copy(option));
                            $scope.queryParam={};
                            $scope.current=function(item){
                                $scope.currentObjList=[];
                                if($scope.option.multiple){
                                    item.isChoiced = !item.isChoiced;
                                }else{
                                    angular.forEach($scope.dataList,function(obj){
                                        obj.isChoiced=false;
                                    });
                                    item.isChoiced=true;
                                }
                            }
                            $scope.choice = function(){
                                //确定按钮
                                produceCurrentObjList();
                                $modalInstance.close($scope.currentObjList);
                            };
                            $scope.currentSave=function(item){
                                item.isChoiced=true;
                                $scope.choice();
                            }
                            $scope.cancel = function () {
                                //取消按钮
                                $modalInstance.dismiss('cancel');
                            };
                            $scope.clear = function () {
                                //清除按钮
                                $modalInstance.dismiss('clear');
                            };
                            $scope.formatter = function(val, column){
                                    return $filter(column.filter)(val, column.formatter);
                            };
                            $scope.pageInfoSetting = {
                                pageSize:10,
                                pageNum:1
                            };
                            $scope.loadParams={};
                            $scope.loadParams=$scope.pageInfoSetting;
                            if($scope.option.handleParams){
                                $scope.loadParams = $scope.option.handleParams($scope.loadParams, option);
                            }
                            var pageSizeName = "pageSize";
                            var pageNumName = "pageNum";
                            if($scope.option.pageSetting){
                                $scope.loadParams[$scope.option.pageSetting.pageNumName]=$scope.loadParams.pageNum;
                                $scope.loadParams[$scope.option.pageSetting.pageSizeName]=$scope.loadParams.pageSize;
                                if($scope.option.pageSetting.pageNumName){
                                    pageNumName = $scope.option.pageSetting.pageNumName;
                                }
                                if($scope.option.pageSetting.pageSizeName){
                                    pageSizeName = $scope.option.pageSetting.pageSizeName;
                                }
                            }
                            $scope.loadDataList = function(){
                                if(!$scope.option.hidePagination){
                                    if($scope.queryParams){
                                        for(var key in $scope.queryParams){
                                            $scope.loadParams[key]=$scope.queryParams[key];
                                        }
                                    }
                                }
                                if($scope.pageInfoSetting){
                                    $scope.loadParams[pageNumName] = $scope.pageInfoSetting.pageNum;
                                    $scope.loadParams[pageSizeName] = $scope.pageInfoSetting.pageSize;
                                }
                                if($scope.option.parentConstraint){
                                    if($scope.option.parentName){
                                        $scope.loadParams[$scope.option.parentName]=$scope.option.parentConstraint;
                                    }
                                }
                                var resourceInstance = $scope.option.loadEvent($scope.loadParams).$promise || $scope.option.loadEvent(params);
                                resourceInstance.then(function(result){
                                    if(result.data){
                                        console.log(result.data);
                                        $scope.dataList=result.data;
                                        $scope.pageInfoSetting = result.pageInfo;

                                    }else{
                                        $scope.dataList=[];
                                    }
                                });
                            }
                            $scope.reset = function(){
                                if($scope.queryParams){
                                    for(var key in $scope.queryParams){
                                        $scope.loadParams[key]='';
                                    }
                                    $scope.queryParams={};
                                }
                                $scope.loadDataList();
                            }
                            $scope.iconsort=false;
                            $scope.sort=function(name){
                                if($scope.option.sort){
                                    $scope.iconsort=name;
                                    $scope.activeThis=name;
                                    if($scope.queryParam.sort && $scope.queryParam.sort === name){
                                        $scope.queryParam.sort = "-" + name;
                                        $scope.sortway=true;
                                    }else{
                                        $scope.queryParam.sort = name;
                                        $scope.sortway=false;
                                    }
                                    $scope.dataList= $filter('orderBy')($scope.dataList,$scope.queryParam.sort,true);
                                }
                            }
                            function produceCurrentObjList(){
                                angular.forEach($scope.dataList,function(obj){
                                   if(obj.isChoiced){
                                       $scope.currentObjList.push(obj);
                                   }
                                })
                            }
                            function init(){
                                if($scope.option){
                                    if($scope.option.loadEvent){
                                        $scope.loadDataList();
                                    };
                                    if($scope.option.filters){
                                        $scope.option.showFilter=true;
                                        $scope.queryParams={};
                                        angular.forEach($scope.option.filters,function(obj){
                                            if(!obj.placeholder){
                                                obj.placeholder='请输入'+obj.title;
                                            }
                                        })
                                    };
                                        if($scope.option['hidePagination']){
                                            $scope.option.hidePagination=true;
                                        }
                                        if($scope.option['multiple']){
                                            $scope.option.multiple=true
                                        }
                                }
                                console.log($scope.option);
                            }
                            init();
                        }]
                }).result.then(function(data){
                        //更改form表单状态
                        if($element.parents('form') && $element.parents('form')[0] && $element.parents('form')[0].name &&
                            $element.parents('form').scope()[$element.parents('form')[0].name] &&$element.parents('form').scope()[$element.parents('form')[0].name].$setDirty){
                            $element.parents('form').scope()[$element.parents('form')[0].name].$setDirty();
                        }
                    if(angular.isDefined($scope.choiceOption.choiceModelLabel)){
                        if($scope.choiceOption.handleResult && $scope.choiceOption.handleResult.choiceModelLabel){
                            if($scope.choiceOption.multiple){
                                $scope.choiceModelLabel=$scope.choiceOption.handleResult.choiceModelLabel(data);
                            }else{
                                if(angular.isUndefined($scope.choiceModelLabel)){
                                    $scope.choiceModelLabel = "";
                                }
                                $scope.choiceModelLabel = $scope.choiceOption.handleResult.choiceModelLabel(data[0]);
                            }
                        }else{
                            if($scope.choiceOption.multiple){
                                if(!$scope.choiceOption.choiceLabelKey){
                                    throw new Error("The choice-widget use 'multiple' property and 'choice-model-mabel' directive must be define 'choiceLabelKey' property");
                                }
                                var labels = null;
                                angular.forEach(data, function(val, key){
                                    if(labels == null){
                                        labels = val[$scope.choiceOption.choiceLabelKey]
                                    }else{
                                        labels = labels + ";" + val[$scope.choiceOption.choiceLabelKey]
                                    }
                                });
                                if(labels != null){
                                    $scope.choiceModelLabel = labels + ";";
                                }
                            }else{
                                if(angular.isUndefined($scope.choiceModelLabel)){
                                    $scope.choiceModelLabel = "";
                                }
                                $scope.choiceModelLabel=data[0][$scope.choiceOption.choiceLabelKey];
                            }
                        }
                    }
                    if(angular.isDefined($attrs.ngModel)){
                        if($scope.choiceOption.handleResult && $scope.choiceOption.handleResult.ngModel){
                            if($scope.choiceOption.multiple){
                                $scope.ngModel=$scope.choiceOption.handleResult.ngModel(data);
                            }else{
                                $scope.ngModel=$scope.choiceOption.handleResult.ngModel(data[0]);
                            }
                        }else{
                            if($scope.choiceOption.multiple){
                                $scope.ngModel= data;
                            }else{
                                $scope.ngModel= data[0][$scope.choiceOption.choiceValueKey];
                            }
                        }
                    }
                    if(angular.isDefined($attrs.choiceOption)){
                        if($scope.choiceOption && $scope.choiceOption.onChoice){
                            $scope.choiceOption.onChoice(data);
                        }
                    }
                    if($attrs.choiceChange){
                        var t = $timeout(function(){
                            $scope.choiceChange();
                            $timeout.cancel(t);
                        })

                    }

                },function(data){
                    if(data=='clear'){
                        if($element.parents('form') && $element.parents('form')[0] && $element.parents('form')[0].name &&
                            $element.parents('form').scope()[$element.parents('form')[0].name] &&$element.parents('form').scope()[$element.parents('form')[0].name].$setDirty){
                            $element.parents('form').scope()[$element.parents('form')[0].name].$setDirty();
                        }
                        if(angular.isDefined($attrs.choiceOption)){
                            if($scope.choiceOption && $scope.choiceOption.onChoice){
                                $scope.choiceOption.onChoice([]);
                            }
                        }
                        if(angular.isDefined($attrs.ngModel)){
                            if($scope.choiceOption && $scope.choiceOption.multiple){
                                $scope.ngModel = [];
                            }else{
                                $scope.ngModel='';
                            }
                        }
                        if(angular.isDefined($scope.choiceOption.choiceModelLabel)){
                            $scope.choiceModelLabel='';
                        }
                        if($attrs.choiceChange){
                            var t = $timeout(function(){
                                $scope.choiceChange();
                                $timeout.cancel(t);
                            })
                        }
                    }
                })
            }
        }]
    }
}]);

/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').provider('UiaBoxConfig', [function(){
    this.globalTemplateUrl = 'uia/template/box.html';
    this.$get = [function(){
        return {
            globalTemplateUrl:this.globalTemplateUrl
        }
    }];
}]).controller('UiaBoxController', ['$scope', '$filter', 'uiaDialog', '$timeout',
function ($scope, $filter, $dialog, $timeout) {
    $scope.boxOption = angular.extend({
        formName: "uiaBox_" + new Date().getTime()
    }, $scope.boxOption);
    $scope.formData = {};
    $scope.cancel = function(){
        if($scope.boxOption.cancelBtn.click){
            $scope.boxOption.cancelBtn.click();
            return;
        }
    };
    $scope.save = function(){
        if(!$scope[$scope.boxOption.formName].validate()){
            return;
        }
        $dialog.confirm('请确认是否保存？').then(function(){
            if($scope.formData.id){
                $scope.boxOption.ApiService.update($scope.formData).$promise.then(function(data){
                    $timeout(function(){
                        $scope.lock();
                    }, true);
                    if($scope.boxOption.saveBtn.callback){
                        $scope.boxOption.saveBtn.callback();
                    }
                });
            }else{
                $scope.boxOption.ApiService.save($scope.formData).$promise.then(function(data){
                    $scope.formData = angular.copy(data);
                    $timeout(function(){
                        $scope.lock();
                    }, true);
                    if($scope.boxOption.saveBtn.callback){
                        $scope.boxOption.saveBtn.callback();
                    }
                });
            }
        });
    };
    $scope.invalid = function(){
        return $scope[$scope.boxOption.formName].$invalid;
    };
    $scope.unlock = function(){
        $scope[$scope.boxOption.formName].unlock();
    };
    $scope.lock = function(){
        $scope[$scope.boxOption.formName].lock();
    };
    $scope.locked = function(){
        return $scope[$scope.boxOption.formName].locked;
    };
    $scope.unlocked = function(){
        return !$scope[$scope.boxOption.formName].locked;
    };
    $scope.viewEvent = function(){
        if($scope.boxOption.formData.id){
            $scope.boxOption.ApiService.get($scope.boxOption.formData).$promise.then(function(data){
                $scope.formData = data;
                $timeout(function(){
                    $scope.lock();
                }, true);
            });
        }
    };
    // 设置filters属性默认值
    var setPlaceholder = function(){
        angular.forEach($scope.boxOption.columns, function(val, key){
            if(!val.placeholder){
                val.placeholder = '请输入' + val.title;
            }
        });
    };
    // 校验规则
    var setValidRule = function(){
        var rules = {},
            messages = {};
        angular.forEach($scope.boxOption.columns, function(val, key){
            if(val.rules){
                angular.forEach(val.rules, function(ruleVal, rule){
                    rules[val.name] = rules[val.name] || {};
                    rules[val.name][rule] = ruleVal;
                    if(rule == 'required'){
                        val.required = 'required';
                    }
                })
            }
            if(val.messages){
                angular.forEach(val.messages, function(message, rule){
                    messages[val.name] = messages[val.name] || {};
                    messages[val.name][rule] = message;
                })
            }
        });
        $scope.validateOption = {
            rules:rules,
            messages:messages
        };
    };
    var init = function(){
        setPlaceholder();
        setValidRule();
        if($scope.boxOption.formData){
            $scope.viewEvent();
        }
        if($scope.boxOption.params && $scope.boxOption.params.action == 'ADD'){
            $timeout(function () {
                $scope.unlock();
            })
        }
    };
    init();
}]).directive('uiaBox', ['UiaBoxConfig', function (UiaBoxConfig) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true, //嵌入
        scope: {
            boxOption: "="
        },
        link:function(scope, element, attr, ctrl){
            if(!attr.boxOption){
                throw new Error('the "uia-box" directive must be define "box-option"');
            }
        },
        templateUrl: function($element, $attr){
            return $attr.templateUrl || UiaBoxConfig.globalTemplateUrl || 'uia/template/box.html';
        },
        controller:"UiaBoxController"
    };
}]);
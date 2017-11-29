/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').directive('uiaForm',['$uiaValidateDefault', '$timeout', function($uiaValidateDefault, $timeout){
    return{
        restrict:'A',
        require: 'form',
        scope:{
            validateOption:"="
        },
        link: function(scope, element, attr, ctrl){
            // scope.storeData = null;
            // scope.$watch('formModel', function(newVal, oldVal){
            //     if(!ctrl.$dirty){
            //         scope.storeData = angular.copy(newVal);
            //     }
            // }, true);
            // ctrl.persisted = function(data){
            //     scope.storeData = angular.copy(data);
            //     ctrl.$dirty = false;
            // };
            ctrl.lock = function(){
                findInputEle(true);
                ctrl.locked = true;
                // scope.formModel = angular.copy(scope.storeData);
                layer.closeAll();
            };
            ctrl.unlock = function(){
                findInputEle(false);
                ctrl.locked = false;
            };
            var findInputEle = function(locked){
                $timeout(function(){
                    $(element).find("input,textarea").each(function(){
                        var isIgnore = $(this).attr('ignore-disabled');
                        if(isIgnore == undefined){
                            $(this).attr('readonly', locked);
                        }
                        if($(this).hasClass('uia-date')){
                            $(this).attr('readonly', true);
                            $(this).attr('disabled', locked);
                        }
                    });
                    $(element).find("select").each(function(){
                        var isIgnore = $(this).attr('ignore-disabled');
                        if(isIgnore == undefined){
                            $(this).attr('disabled', locked).trigger("chosen:updated");
                        }
                    });
                });
            }
            var initValidateConfig = function(){
                var option = scope.validateOption;
                option = angular.extend({}, $uiaValidateDefault, option);
                ctrl.validateConfig = angular.copy(option);
                ctrl.validate = function(){
                    if(!ctrl.$dirty){
                        return;
                    }
                    if($(element).validate(ctrl.validateConfig).form() && $(element).validate(ctrl.validateConfig).valid()){
                        return true;
                    }
                    return false;
                };
                ctrl.validateElement = function(target){
                    return $(element).validate().element(target);
                }
                $('input,select,textarea').on('focusout',function(){
                    $(this).closest('form').validate().element($(this));
                });
                if($(element).find("input[uia-date]").datetimepicker){
                    $(element).find("input[uia-date]").datetimepicker().on('changeDate', function(ev){
                        $(ev.target).valid();
                    });
                }
                // $('input,select,textarea').on('blur',function(){
                //     var index = $(this).attr('layer-tip-index');
                //     layer.close(index);
                // }).on('focus', function(){
                //     // $("#form1").validate().element($("#elementId"))
                //     var ruleMessage = "";
                //     var tipIndex = $(this).attr('layer-tip-index');
                // layer.close(tipIndex);
                // tipIndex = layer.tips(ruleMessage, this, {
                // 	tips: [2, '#3595CC'],
                // 	time:0,
                // 	tipsMore:true
                // });
                // $(this).attr('layer-tip-index', tipIndex);
                // });
                // js 依赖
                $timeout(function(){
                    angular.forEach(option.rules, function(rule, index){
                        var target = $(element).find("[name='" + index + "']");
                        target.attr('required', true);
                    })
                }, 1000);
            };
            var init = function(){
                // 默认锁定
                // ctrl.lock();
                initValidateConfig();
            }
            init();
        }
    }
}]);
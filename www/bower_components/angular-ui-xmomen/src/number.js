/**
 * Created by TANXINZHENG481 on 2017-06-15.
 */
angular.module('uia').directive('uiaNumber',['$timeout', function($timeout){
    return {
        require:'ngModel',
        scope:{
            uiaNumberOption:"=?",
            numberType:'@'
        },
        link: function(scope, element, attr, ngModel){
            var config = {

            };
            scope.uiaNumberOption = scope.uiaNumberOption || {};
            scope.uiaNumberOption = angular.extend(config, scope.uiaNumberOption);
            if(attr.numberType){
                scope.uiaNumberOption.type = scope.numberType;
            }
            var type = angular.copy(scope.uiaNumberOption.type);
            switch (type){
                case 'percentage':
                    $(element).inputmask({
                        alias:'percentage',
                        placeholder:"",
                        suffix:' % ',
                        max:9999999999,
                        autoUnmask:true,
                        // rightAlign:true,
                        onUnMask:function(maskedValue, unMaskedValue){
                            var float = parseFloat(unMaskedValue);
                            if(float && !isNaN(float)){
                                float = float/100;
                            }
                            // 修复因jquery.validate校验时required校验value.length > 0的问题（数字无length属性）
                            return float+"";
                        }
                    });
                    ngModel.$formatters.push(function (value) {
                        if(value != "" && value != null && value != undefined){
                            var num = parseFloat(value);
                            if (!isNaN(num) && angular.isNumber(num)) {
                                return (value * 100); //format
                            }
                        }
                        return value;
                    });
                    break;
                case 'integer':
                    $(element).inputmask({
                        alias:'integer',
                        digits:0,
                        suffix:' ',
                        placeholder:"",
                        max:999999999999,
                        // rightAlign:true
                    });
                    break;
                case 'decimal':
                    $(element).inputmask({
                        alias:'numeric',
                        placeholder:"",
                        suffix:' ',
                        max:999999999999,
                        // rightAlign:true
                    });
                    break;
                case 'million':
                    $(element).inputmask({
                        alias:'currency',
                        placeholder:"",
                        suffix:' ',
                        autoUnmask:true,
                        prefix:'',
                        digits: 4
                    });
                    break;
                case 'currency':
                    $(element).inputmask({
                        alias:'currency',
                        placeholder:"",
                        suffix:' ',
                        autoUnmask:true,
                        prefix:'',
                        digits: 2
                    });
                    break;
                default :
                    break;
            }
        }
    }
}]);
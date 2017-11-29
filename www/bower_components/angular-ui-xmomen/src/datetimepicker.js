/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').directive('uiaDate',["uibDateParser", "$filter",  function(dateParser, $filter){
    return {
        require:'ngModel',
        scope:{
            uiaDateOption:"="
        },
        link : function(scope,elem,attr,ctrl){
            var dateConfig = scope.uiaDateOption;
            var config = angular.extend({
                autoclose: true,
                todayBtn: true,
                minView:3,
                startDate: dateParser.parse('1900-01-01', 'yyyy-MM-dd'),
                endDate: dateParser.parse('2100-01-01', 'yyyy-MM-dd'),
                format:"yyyy-mm-dd",
                forceParse:true,
                keyboardNavigation:true,
                pickerPosition: "bottom-left",
                language:'zh-CN'
            }, dateConfig);

            $(elem).datetimepicker(config).on('change',function(){
                scope.$apply(function(){
                    ctrl.$setViewValue(elem.val());
                });
            }).addClass('uia-date').attr("readonly", true);
            //
            // ctrl.$formatters.push(function (value) {
            //     if (angular.isNumber(value) && config.format == 'yyyy-mm-dd') {
            //         return dateFilter(value, 'yyyy-MM-dd'); //format
            //     }
            //     return value;
            // });
            // ctrl.$parsers.unshift(function (value) {
            //     if (angular.isString(value) && value.length > 0) {
            //         if(config.valueType == 'yyyy-MM-dd'){
            //             return value;
            //         }else if(config.valueType == 'year'){
            //             return parseInt(value);
            //         }else{
            //             var reg = new RegExp(/^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)/);
            //             if(reg.test(value)){
            //                 return new Date(dateParser.parse(value, 'yyyy-MM-dd')).getTime();
            //             }
            //             return value;
            //         }
            //     } else {
            //         if(angular.isNumber(value) && value.length > 0){
            //             if(config.valueType == 'year'){
            //                 return value;
            //             }
            //             return new Date(dateParser.parse(value, 'yyyy-MM-dd')).getTime();
            //         }
            //         return value;
            //     }
            // });

            // 添加清除按钮
            $(elem).next("span").children("button").bind('click', function(){
                $(elem).datetimepicker("show");
            });
            //兼容点击按钮组日历图标显示控件
            $(elem).next("span").children("button").bind('click', function(){
                $(elem).datetimepicker("show");
            });
        }
    }
}]);
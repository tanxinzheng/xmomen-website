/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').run(['$uiaValidateRule', '$uiaValidateProvider', function($uiaValidateRule, $uiaValidateProvider){
    angular.forEach($uiaValidateRule, function(val, key){
        $uiaValidateProvider.addRule(key, val);
    });
    $.extend($.validator.messages, {
        required: "这是必填字段",
        remote: "请修正此字段",
        email: "请输入有效的电子邮件地址",
        url: "请输入有效的网址",
        date: "请输入有效的日期",
        dateISO: "请输入有效的日期 (YYYY-MM-DD)",
        number: "请输入有效的数字",
        digits: "请输入有效的正整数",
        creditcard: "请输入有效的信用卡号码",
        equalTo: "你的输入不相同",
        extension: "请输入有效的后缀",
        maxlength: $.validator.format("最多可以输入 {0} 个字符"),
        minlength: $.validator.format("最少要输入 {0} 个字符"),
        rangelength: $.validator.format("请输入长度在 {0} 到 {1} 之间的字符串"),
        range: $.validator.format("请输入范围在 {0} 到 {1} 之间的数值"),
        max: $.validator.format("请输入不大于 {0} 的数值"),
        min: $.validator.format("请输入不小于 {0} 的数值")
    });
}]).value("$uiaValidateRule", {
    // 整数
    integer: {
        rule:/^\-?[0-9]+$/,
        message:"请输入正确的整数"
    },
    // 正浮点数字
    positiveDecimal: {
        rule:/^[0-9]*\.?[0-9]+$/,
        message:"请输入不小于0的数字"
    },
    // 大小写字母或数字
    notSpecialCharacter: {
        rule:/^[A-Za-z0-9]+$/i,
        message:"请输入大小写字母或数字"
    },
    // 中国身份证
    chinaId: {
        rule:/^[1-9]\d{5}[1-9]\d{3}(((0[13578]|1[02])(0[1-9]|[12]\d|3[0-1]))|((0[469]|11)(0[1-9]|[12]\d|30))|(02(0[1-9]|[12]\d)))(\d{4}|\d{3}[xX])$/,
        message:"请输入正确的身份证号码"
    },
    // 中国邮政编码
    chinaZip: {
        rule:/^\d{6}$/,
        message:"请输入正确的邮政编码"
    },
    // 手机号码
    telephone: {
        rule:/^1(3|4|5|7|8)\d{9}$/,
        message:"请输入正确的手机号码"
    },
    // IP
    ip: {
        rule:/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
        message:"请输入正确的IP"
    },
    latitude: {
        rule:/^-?(([1-8]\d?)|([1-8]\d)|90)(\.\d{1,6})?$/,
        message:"请输入[±90.000000]的有效纬度值"
    },
    longitude: {
        rule:/^-?(([1-9]\d?)|(1[0-7]\d)|180)(\.\d{1,6})?$/,
        message:"请输入[±180.000000]的有效经度值"
    }
}).constant("$uiaValidateDefault", {
    errorElement: "font",
    errorClass: "error",
    // onblur: function(element){
    //     $(element).valid();
    // },
    onfocusout:function(element){
        $(element).valid();
    },
    showErrors: function(errorMap, errorList) {
        $.each(this.successList, function(index, value) {
            var index = $(value).attr('layer-tip-index');
            layer.close(index);
        });
        return $.each(errorList, function(index, value) {
            var tipIndex;
            tipIndex = $(value.element).attr('layer-tip-index');
            layer.close(tipIndex);
            tipIndex = layer.tips(value.message, value.element, {
                tips: [2, '#3595CC'],
                time:0,
                tipsMore:true
            });
            $(value.element).attr('layer-tip-index', tipIndex);
        });
    }
}).factory("$uiaValidateProvider", function () {
    return {
        setDefaults: function (options) {
            $.validator.setDefaults(options);
        },
        addMethod: function (name, func, errorText) {
            $.validator.addMethod(name, func, errorText);
        },
        addRule: function(key, rule){
            this.addMethod(key, function(value, element){
                var pattern = new RegExp(rule.rule);
                if(value === false){
                    return false;
                }
                if(value != ""){
                    if(!pattern.test(value)){
                        return false;
                    }
                }
                return true;
            }, rule.message);
        }
    }
}).directive('uiaValidate', ["$uiaValidateDefault", function ($uiaValidateDefault) {
    return {
        restrict: 'A',
        scope:{
            uiaValidateOption:"="
        },
        require: "form",
        link: function (scope, element, attr, ctrl) {
            if(attr.ignoreTip && attr.ignoreTip == 'true'){
                ctrl.ignoreTip = true;
            }
            var option = scope.uiaValidateOption;
            option = angular.extend($uiaValidateDefault, option);
            ctrl.validateConfig = angular.copy(option);
            ctrl.validate = function(){
                if($(element).validate(ctrl.validateConfig).form() && $(element).validate(ctrl.validateConfig).valid()){
                    return true;
                }
                return false;
            };
            $('input,select,textarea').live('blur',function(){
                $(this).closest('form').validate().element($(this));
            });
            var error = "<span class='error'> *</span>";
            ///^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/
            $(element).find("input[required]").each(function(){
                var next = $(this).next();
                if(this['type'] == 'hidden' || next[0] != null && next[0].nodeName == 'SPAN'){
                    return;
                }
                $(error).insertAfter(this);
            });
            $(element).find("select[required]").each(function(){
                var next = $(this).next();
                if(next[0] != null && next[0].nodeName == 'SPAN'){
                    return;
                }
                $(error).insertAfter(this);
            });
            if($(element).find("input[uia-date]").datetimepicker){
                $(element).find("input[uia-date]").datetimepicker().on('changeDate', function(ev){
                    $(ev.target).valid();
                });
            }
        }
    };
}]);
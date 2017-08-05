/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', 'ValidationCodeAPI', '$interval', 'AppAPI', function($scope, $http, $state, ValidationCodeAPI, $interval, AppAPI) {
        $scope.pageSetting = {
            message:"发送验证码",
            type:1
        }
        $scope.user = {};
        $scope.loading = false;
        $scope.resetPassword = function(){
            if(!$scope.findPassword.validate()){
                return;
            }
            var receiver;
            if($scope.pageSetting.type == 1){
                receiver = $scope.user.phone;

            }else if($scope.pageSetting.type == 2){
                receiver = $scope.user.email;
            }
            $scope.loading = true;
            AppAPI.findPassword({
                type:$scope.pageSetting.type,
                receiver:receiver,
                code:$scope.user.code,
                password:$scope.user.password
            }, function (data) {
                var i = 5;
                var timer = $interval(function () {
                    i--;
                    $scope.pageSetting.tip = "密码已重置成功，" + i + '秒后自动跳转至登录页面';
                    if(i == 0){
                        $interval.cancel(timer);
                        $state.go('access.signin')
                    }
                }, 1000);
            }).finally(function () {
                $scope.loading = false;
            })
        };
        $scope.sendCode = function(){
            var receiver = null;
            if($scope.pageSetting.type == 1){
                if(!$scope.findPassword.validateElement($("#phone")) ||
                    !$scope.findPassword.validateElement($("#password")) ||
                    !$scope.findPassword.validateElement($("#repeatPassword"))){
                    return;
                }
                receiver = $scope.user.phone;

            }else if($scope.pageSetting.type == 2){
                if(!$scope.findPassword.validateElement($("#email")) ||
                    !$scope.findPassword.validateElement($("#password")) ||
                    !$scope.findPassword.validateElement($("#repeatPassword"))){
                    return;
                }
                receiver = $scope.user.email;
            }
            ValidationCodeAPI.create({
                type: $scope.pageSetting.type,
                receiver: receiver
            }, function(data){
                $scope.pageSetting.disabledSendCode = true;
                var i = 60;
                var intervalCode = $interval(function () {
                    i--;
                    $scope.pageSetting.message = i + '秒';
                    if(i == 0){
                        $interval.cancel(intervalCode);
                        $scope.pageSetting.disabledSendCode = false;
                        $scope.pageSetting.message = "发送验证码";
                    }
                }, 1000);
            })

        }
    }];
});
/**
 * Created by tanxinzheng on 16/8/12.
 */
define(function () {
    return ["$scope", "AppAPI", '$uibModal', function($scope, AppAPI, $uibModal){
        $scope.account = {};
        var getAccountInfo = function () {
            AppAPI.getAccount({}, function(data){
                $scope.account = data;
            });
        }
        $scope.openUpdatePassword = function () {
            $uibModal.open({
                templateUrl: 'updatePassword.html',
                modal:true,
                size:"lg",
                controller: ['$scope', '$uibModalInstance', "$uibModal", "AccountAPI", "$state", function($scope, $uibModalInstance, $uibModal, AccountAPI, $state){
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                    $scope.resetPassword = function () {
                        if(!$scope.form.validate()){
                            return;
                        }
                        AccountAPI.resetPassword($scope.user, function(){
                            $uibModalInstance.close();
                            $state.go('access.signin');
                        })
                    }
                    var init = function(){

                    };
                    init();
                }]
            });
        }
        $scope.bind = function (type) {
            $uibModal.open({
                templateUrl: 'bind.html',
                modal:true,
                size:"lg",
                resolve: {
                    Option: function(){
                        if(type == 1){
                            return {
                                type:1,
                                title:"绑定手机"
                            }
                        }else if(type = 2){
                            return {
                                type:2,
                                title:"绑定邮箱"
                            }
                        }

                    }
                },
                controller: ['$scope', '$uibModalInstance', "$uibModal", "AccountAPI", "$state", "Option", "$dialog", "ValidationCodeAPI", "$interval",
                function($scope, $uibModalInstance, $uibModal, AccountAPI, $state, Option, $dialog, ValidationCodeAPI, $interval){
                    $scope.Option = Option;
                    $scope.Option.message = "发送验证码";
                    $scope.user = {};
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    };
                    $scope.bind = function () {
                        if(!$scope.form.validate()){
                            return;
                        }
                        var receiver;
                        if(Option.type == 1){
                            receiver = $scope.user.phone;
                        }else if(Option.type == 2){
                            receiver = $scope.user.email;
                        }
                        $scope.loading = true;
                        AccountAPI.bindAccount({
                            type: Option.type,
                            code: $scope.user.code,
                            receiver: receiver
                        }, function(){
                            $dialog.alert("绑定成功");
                            $uibModalInstance.close();
                        }).$promise.finally(function () {
                            $scope.loading = false;
                        });
                    }
                    $scope.sendCode = function(){
                        var receiver = null;
                        if(Option.type == 1){
                            if(!$scope.form.validateElement($("#phone"))){
                                return;
                            }
                            receiver = $scope.user.phone;
                        }else if(Option.type == 2){
                            if(!$scope.form.validateElement($("#email"))){
                                return;
                            }
                            receiver = $scope.user.email;
                        }
                        ValidationCodeAPI.create({
                            type: $scope.Option.type,
                            receiver: receiver
                        }, function(data){
                            $scope.Option.disabledSendCode = true;
                            var i = 60;
                            var intervalCode = $interval(function () {
                                i--;
                                $scope.Option.message = i + '秒';
                                if(i == 0){
                                    $interval.cancel(intervalCode);
                                    $scope.Option.disabledSendCode = false;
                                    $scope.Option.message = "发送验证码";
                                }
                            }, 1000);
                        })
                    }
                }]
            }).result.then(function () {
                getAccountInfo();
            });
        }
        var init = function () {
            getAccountInfo();
        }
        init();
    }];
});
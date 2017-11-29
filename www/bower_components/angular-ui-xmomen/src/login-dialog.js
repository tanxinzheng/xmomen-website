/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').run(['$uibModal', 'uiaMessage', function($uibModal, uiaMessage){
    uiaMessage.subscribe("login", function(){
        $uibModal.open({
            templateUrl: '/template/login-dialog.html',
            //size:"sm",
            backdrop: 'static',
            windowTopClass:"isParent",
            appendTo: $(window.parent.document.body),
            controller:["$scope", "$uibModalInstance", "$http", "uiaConfig", function($scope, $modalInstance, $http, uiaConfig){
                $scope.user = {};
                $scope.loginDialogForm = {};
                $scope.change = function(evt){
                    $(evt.target).valid();
                };
                $scope.loginBtnLoading = false;
                $scope.login = function(){
                    $scope.loginBtnLoading = true;
                    $http.post(uiaConfig.ajaxLoginUrl, null, {
                        params:{
                            j_username: $scope.user.username,
                            j_password: $scope.user.password
                        }
                    }).then(function(data){
                        if(data.status == 200){
                            $modalInstance.close();
                        }
                    })['finally'](function(){
                        $scope.loginBtnLoading = false;
                    });
                };
                $scope.no = function(){
                    $modalInstance.dismiss();
                };
            }]
        });
    });
}]);

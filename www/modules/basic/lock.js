/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', 'AccountAPI', '$http', '$state', '$dialog', '$rootScope', 'AppAPI', function($scope, AccountAPI, $http, $state, $dialog, $rootScope, AppAPI) {
        $scope.account = {};
        AccountAPI.getAccount({}, function(data){
            $scope.account = data;
            $http.post($rootScope.app.logout);
        });
        $scope.unLock = function(){
            if(!$scope.account.password){
                $dialog.alert('请输入密码');
                return;
            }
            if($scope.isLoading){
                return;
            }
            $scope.isLoading = true;
            AppAPI.login({
                username: $scope.account.username,
                password: $scope.account.password
            }, function(){
                delete window.sessionStorage.isLocked;
                $state.go('app.dashboard');
            }).$promise.finally(function(){
                $scope.isLoading = false;
            });
        }
    }];
});
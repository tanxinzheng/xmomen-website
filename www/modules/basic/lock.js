/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', 'AppAPI', '$http', '$state', '$dialog', '$rootScope', function($scope, AppAPI, $http, $state, $dialog, $rootScope) {
        $scope.account = {};
        AppAPI.getAccount({}, function(data){
            $scope.account = data;
        });
        $http.post($rootScope.app.logout);
        $scope.unLock = function(){
            if(!$scope.account.password){
                $dialog.alert('请输入密码');
                return;
            }
            if($scope.isLoading){
                return;
            }
            $scope.isLoading = true;
            $http.post('/api/login', null, {
                params:{
                    username: $scope.account.username,
                    password: $scope.account.password
                }
            }).then(function(response) {
                $state.go('app.dashboard');
            }).finally(function(){
                $scope.isLoading = false;
            });
        }
    }];
});
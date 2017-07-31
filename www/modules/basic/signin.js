/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', function($scope, $http, $state) {
        $scope.user = {};
        $scope.login = function() {
            $scope.form.isLoading = true;
            $http.post('/api/login', null, {
                params:{
                    username: $scope.user.username,
                    password: $scope.user.password,
                    rememberMe: $scope.user.rememberMe,
                }
            }).then(function(response) {
                $state.go('app.dashboard');
            }).finally(function(){
                $scope.form.isLoading = false;
            });
        };
    }];
});
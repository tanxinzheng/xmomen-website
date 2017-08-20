/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', "AppAPI", "$window", function($scope, $http, $state, AppAPI, $window) {
        $scope.user = {};
        $scope.login = function() {
            $scope.form.isLoading = true;
            AppAPI.login({
                username: $scope.user.username,
                password: $scope.user.password,
                rememberMe: $scope.user.rememberMe,
            }).$promise.then(function(data) {
                $window.sessionStorage.token = data.token;
                $state.go('app.dashboard');
            }).finally(function(){
                $scope.form.isLoading = false;
            });
        };
    }];
});
/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', "AppAPI", "$window", "uiaMessage", function($scope, $http, $state, AppAPI, $window, uiaMessage) {
        $scope.user = {};
        $scope.login = function() {
            $scope.form.isLoading = true;
            AppAPI.login({
                username: $scope.user.username,
                password: $scope.user.password,
                rememberMe: $scope.user.rememberMe,
            }).$promise.then(function(data) {
                $window.sessionStorage.token = data.token;
                // uiaMessage.publish('refreshPermission');
                $state.reload('app.dashboard');
            }).finally(function(){
                $scope.form.isLoading = false;
            });
        };
    }];
});
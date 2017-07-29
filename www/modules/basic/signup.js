/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', function($scope, $http, $state) {
        $scope.user = {};
        $scope.signup = function() {
            if(!$scope.form.validate()){
                return;
            }
            $http.post('/api/signup', {
                name: $scope.user.name,
                username: $scope.user.username,
                password: $scope.user.password
            }).then(function(response) {
                $state.go('app.dashboard');
            });
        };
    }];
});
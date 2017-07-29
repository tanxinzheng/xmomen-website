/**
 * Created by tanxinzheng on 17/7/23.
 */
define(function () {
    return ['$scope', '$http', '$state', function($scope, $http, $state) {
        $scope.user = {};
        $scope.login = function() {
            $http.post('/api/login', {
                username: $scope.user.username,
                password: $scope.user.password
            }).then(function(response) {
                if ( !response.data.user ) {
                    $scope.authError = 'Email or Password not right';
                }else{
                    $state.go('app.dashboard-v1');
                }
            }, function(x) {
                $scope.authError = 'Server Error';
            });
        };
    }];
});
/**
 * Created by tanxinzheng on 16/8/12.
 */
define(function () {
    return ["$scope", "AppAPI", function($scope, AppAPI){
        $scope.Account = {};
        AppAPI.getAccount({}, function(data){
            $scope.Account = data;
        });
    }];
});
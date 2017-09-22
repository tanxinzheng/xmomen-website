define(function(){
    return ["$scope",  "AppAPI", "uiaDialog", "$stateParams", "$uibModal", function($scope, AppAPI, uiaDialog, $stateParams, $uibModal){
        $scope.getNotification = function () {
            AppAPI.getNotificationDetail({
                id:$stateParams.id
            }, function (data) {
                $scope.notification = data;
            })
        };
        var init = function () {
            $scope.dataState = $stateParams.dataState;
            $scope.getNotification();
        }
        init();
    }]
});
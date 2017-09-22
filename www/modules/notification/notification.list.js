define(function(){
    return ["$scope",  "NotificationAPI", "uiaDialog", "$stateParams", "$uibModal", function($scope, NotificationAPI, uiaDialog, $stateParams, $uibModal){
        $scope.notificationList = [];
        $scope.getNotification = function () {
            var dataState;
            if($stateParams.dataState != 'ALL'){
                dataState = $stateParams.dataState;
            }
            NotificationAPI.query({
                pageSize:10,
                pageNum:1,
                dataState:dataState
            }, function (data) {
                $scope.notificationList = data.data;
            })
        };
        var init = function () {
            $scope.currentType = $stateParams.dataState;
            $scope.getNotification();
        }
        init();
    }]
});
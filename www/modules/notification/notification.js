define(function(){
    return ["$scope",  "NotificationAPI", "uiaDialog", "$state", "$uibModal", function($scope, NotificationAPI, uiaDialog, $state, $uibModal){
        $scope.dataStateList = [
            {name: '全部', dataState:'ALL'},
            {name: '未读消息', dataState:'UNREAD'},
            {name: '已读消息', dataState:'READ'},
            {name: '已发送', dataState:'SENT'},
            {name: '草稿', dataState:'DRAFT'},
            {name: '回收站', dataState:'DELETE'}
        ];
        $scope.currentType = 'ALL';
        $scope.switchType = function (dataState) {
            $scope.currentType = dataState;
            $state.go('app.notification.list', {
                dataState:dataState
            });
        }
    }]
});
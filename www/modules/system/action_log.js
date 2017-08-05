define(function(){
    return ["$scope",  "ActionLogAPI", "uiaDialog", "$injector", "$uibModal", function($scope, ActionLogAPI, uiaDialog, $injector, $uibModal){
        $scope.gridOption = {
            id:"user",
            title:'权限',
            loadEvent: ActionLogAPI.query,
            ApiService: ActionLogAPI,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入关键字' },
                { name:'startActionDate', title:'开始操作时间', placeholder:'请输入开始操作时间', type:'date' },
                { name:'endActionDate', title:'截止操作时间', placeholder:'请输入截止操作时间', type:'date' },
            ],
            showRemoveBtn:false,
            showViewBtn:false,
            showAddBtn:false,
            columns:[
                { name:'username', title:'用户名称' },
                { name:'actionName', title:'操作名称' },
                { name:'actionDate', title:'操作时间', type:'date' },
                { name:'clientIp', title:'客户端IP' },
                { name:'targetClass', title:'类名' },
                { name:'targetMethod', title:'方法名' }
            ]
        };
    }]
});
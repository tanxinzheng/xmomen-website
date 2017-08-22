define(function(){
    return ["$scope",  "PermissionAPI", "uiaDialog", "$injector", "$uibModal", function($scope, PermissionAPI, uiaDialog, $injector, $uibModal){
        $scope.gridOption = {
            id:"user",
            title:'权限',
            loadEvent: PermissionAPI.query,
            ApiService: PermissionAPI,
            showFileBtn:true,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入关键字' }
            ],
            columns:[
                { name:'permissionCode', title:'权限代码', sortName:"PERMISSION_CODE" },
                { name:'permissionName', title:'权限名称' },
                { name:'description', title:'权限描述' },
                { name:'active', title:'激活', type:'checkbox' },
                { name:'createdUserName', title:'创建人' },
                { name:'createdTime', title:'创建时间', type:'date' },
                { name:'updatedUserName', title:'修改人' },
                { name:'updatedTime', title:'最新修改时间', type:'date' }
            ],
            boxOption : {
                ApiService: PermissionAPI,
                columns:[
                    { name:'permissionCode', title:'权限代码', rules:{ required: true} },
                    { name:'permissionName', title:'权限名称', rules:{ required: true} },
                    { name:'description', title:'权限描述', rules:{ required: true} },
                    { name:'actions', title:'权限类型', type:'select', dictCode: 'PERMISSION_ACTION', multiple:true },
                    { name:'active', title:'激活', type:'checkbox' }
                ]
            }
        };
    }]
});
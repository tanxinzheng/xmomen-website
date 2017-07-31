/**
 * Created by tanxinzheng on 16/7/3.
 */
define(function(){
    return ["$scope", "$uibModal", "DictionaryAPI",
    function($scope, $uibModal, DictionaryAPI){
        $scope.gridOption = {
            id:"dictionary",
            title:'数据字典',
            loadEvent: DictionaryAPI.query,
            ApiService: DictionaryAPI,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入字典名称或字典代码等关键字查询' }
            ],
//          js定义列字段
            columns:[
                { name:'groupCode', title:'字典类型' },
                { name:'groupName', title:'类型描述' },
                { name:'dictionaryName', title:'字典名称'},
                { name:'dictionaryCode', title:'字典代码'},
                { name:'sort', title:'排序'},
                { name:'active', title:'激活', type:'checkbox'},
                { name:'isShow', title:'显示', type:'checkbox'},
                { name:'createdTime', title:'创建时间', type:'date' }
            ],
            boxOption : {
                ApiService: DictionaryAPI,
                columns:[
                    { name:'groupCode', title:'字典类型' },
                    { name:'groupName', title:'类型描述' },
                    { name:'dictionaryName', title:'字典名称'},
                    { name:'dictionaryCode', title:'字典代码'},
                    { name:'sort', type:"integer", title:'排序'},
                    { name:'active', title:'激活', type:'checkbox'},
                    { name:'isShow', title:'显示', type:'checkbox'}
                ]
            }
        };
    }]
});
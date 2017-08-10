define(function(){
    return ["$scope",  "AttachmentAPI", "uiaDialog", "uiaFileUtils", "$uibModal", function($scope, AttachmentAPI, uiaDialog, uiaFileUtils, $uibModal){
        // 1-缩略图，2-列表
        $scope.viewMode = 1;
        $scope.attachmentList = [];
        $scope.switchViewMode = function(type){
            $scope.viewMode = type;
        }
        $scope.download = function (item) {
            uiaFileUtils.download({
                url:item.attachmentUrl
            })
        }
        $scope.queryData = function(){
            AttachmentAPI.query({
                pageSize:10,
                pageNum:1,
            }, function (data) {
                $scope.attachmentList = data.data;
            })
        }
        $scope.gridOption = {
            id:"user",
            title:'附件',
            loadEvent: AttachmentAPI.query,
            ApiService: AttachmentAPI,
            headerBtns:[
                {
                    title:"缩略图",
                    icon:"fa fa-th",
                    click: function () {
                        $scope.viewMode = 1;
                    }
                }
            ],
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入关键字' }
            ],
            columns:[
                { name:'attachmentGroup', title:'附件所属组' },
                { name:'attachmentKey', title:'附件KEY' },
                { name:'attachmentSize', title:'附件大小' },
                { name:'attachmentPath', title:'附件URL' },
                { name:'attachmentSuffix', title:'附件后缀' },
                { name:'originName', title:'原名称' },
                { name:'uploadTime', title:'上传时间', type:'date' },
                { name:'uploadUserName', title:'上传人' },
                { name:'isPrivate', title:'是否私有', type:'checkbox' }
            ],
            buttons:[
                {
                    title:'下载',
                    click:function (item) {
                        uiaFileUtils.download({
                            url:item.attachmentUrl
                        })
                    }
                }
            ],
            boxOption : {
                ApiService: AttachmentAPI,
                columns:[
                    { name:'attachmentGroup', title:'附件所属组', rules:{ required: true} },
                    { name:'attachmentKey', title:'附件KEY', rules:{ required: true} },
                    { name:'attachmentSize', title:'附件大小', rules:{ required: true} },
                    { name:'attachmentPath', title:'附件URL', rules:{ required: true} },
                    { name:'attachmentSuffix', title:'附件后缀', rules:{ required: true} },
                    { name:'originName', title:'原名称', rules:{ required: true} },
                    { name:'uploadTime', title:'上传时间', type:'date', rules:{ required: true} },
                    { name:'uploadUserId', title:'上传人ID', rules:{ required: true} },
                        { name:'relationId', title:'关联ID' },
                    { name:'isPrivate', title:'是否私有', type:'checkbox' },
                ]
            }
        };
        var init = function () {
            $scope.queryData();
        };
        init();
    }]
});
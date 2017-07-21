/**
 * Created by tanxinzheng on 16/7/3.
 */
define(function(){
    return ["$scope", "$uibModal", "DictionaryAPI", "uiaDialog", "$UrlUtils", function($scope, $uibModal, DictionaryAPI, $dialog, $UrlUtils){
        $scope.pageSetting = {
            formDisabled : true,
            saveBtnLoading : false
        };
        $scope.gridOption = {
            id:"dictionary",
            title:'数据字典',
            loadEvent: DictionaryAPI.query,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键词', placeholder:'请输入关键字进行模糊查询' }
            ],
//          js定义列字段
            columns:[
                { name:'groupCode', title:'字典类型' },
                { name:'groupName', title:'类型描述' },
                { name:'dictionaryName', title:'字典名称'},
                { name:'dictionaryCode', title:'字典代码'},
                { name:'sort', title:'排序'},
                { name:'active', title:'激活', type:'checkbox',
                    checked: function(data){
                        return data.active == 1 ? true:false;
                    }
                },
                { name:'show', title:'显示', type:'checkbox',
                    checked: function(data){
                        return data.show == 1 ? true:false;
                    }
                },
                { name:'createdTime', title:'创建时间', type:'date' }
            ],
            addBtn:{
                permission:"PROJECT:DOCUMENT:NEW",
                handlerParam:function(item){
                    return {
                        action:'add'
                    };
                },
                click:function(item){
                    $scope.add(item);
                }
            },
            viewBtn:{
                permission:"PROJECT:DOCUMENT:VIEW",
                handlerParam:function(item){
                    return {
                        projectNa:item.projectNa
                    };
                },
                click:function(item){
                    $scope.view(item);
                }
            },
            removeBtn:{
                permission:"PROJECT:DOCUMENT:DELETE",
                click: function(item){
                    $dialog.confirm('是否删除该数据？').then(function(){
                        $dialog.alert("删除成功");
                    });
                }
            },
            exportBtn:{
                click:function(){
                    DictionaryAPI.export({});
                }
            }
        };
        $scope.boxOption = {
            columns:[
                { name:'text', title:'文本框',
                    rules:{
                        required:true,
                        maxlength:20
                    },
                    messages:{
                        required:"请输入值",
                        maxlength:"请输入不超过20的字符"
                    }
                },
                { name:'choice', title:'弹出选择框', type:'choice', placeholder:'请选择负责人', choiceOption:{ choiceWidgetType:'user', choiceModelLabel:'userName' } },
                { name:'date', title:'日期控件', type:'date', placeholder:'请输入投资时间' },
                { name:'checkbox', title:'Checkbox控件', type:'checkbox', checked: function(data){
                    return data && data.checkbox == 1 ? true:false;
                } },
                { name:'defaultSelect', title:'下拉框(字典)', type:'select', dictCode:'PROJECT_TYPE' ,rules:{
                    required:true
                }},
                { name:'selectOption', title:'下拉框', type:'select', rules:{
                    required:true
                },  options: function(){
                    return $scope.typeList;
                }, keyName:'id', labelName:'name' },
                { name:'integer', title:'整数', type:'integer', rules:{
                    required:true
                }},
                { name:'percentage', title:'百分比', type:'percentage'},
                { name:'decimal', title:'数字', type:'decimal'},
                { name:'currency', title:'金额', type:'currency'},
                { name:'million', title:'万元', type:'million'},
                { name:'textarea', title:'文本域', type:'textarea'}
            ],
            saveBtn:{
                permission:"PROJECT:DOCUMENT:EDIT",
                saveEvent: function(q, data){
                    if(data.id){
                        UserAPI.update(data, function(result){
                            q.resolve(result);
                        });
                    }else{
                        UserAPI.create(data, function(result){
                            q.resolve(result);
                        });
                    }
                    return q.promise;
                }
            },
            // 初始化
            formData:{
                date:new Date().getTime()
            },
            getEvent: function(q){
                var params = $UrlUtils.getParameters();
                if(params.id){
                    // 修改，查看
                    var id = params.id;
                    DictionaryAPI.get({
                        id:id
                    }, function(data){
                        q.resolve(data);
                    });
                }else{
                    // 新增
                    q.reject({
                        text:"我是初始值"
                    });
                }
                return q.promise;
            }
        };
        var layerIndex;
        // 新增
        $scope.add = function(item){
            layerIndex = layer.open({
                title:"数据字典",
                zIndex:88888,
                skin:'layui-layer-lan',
                resize:false,
                area:['800px'],
                type:1,
                maxmin:true,
                content:$("#dictionary_detail")
            });
        };
        $scope.saveDictionary = function(){
            // if($scope.dictionaryDetailFormName.validate()){
                $dialog.confirm("是否保存数据？").then(function(){
                    $scope.pageSetting.saveBtnLoading = true;
                    if ( !$scope.dictionary.id ) {
                        DictionaryAPI.create($scope.dictionary, function(data,headers){
                            $dialog.success("新增成功");
                            $scope.cancel();
                        }).$promise.finally(function(){
                            $scope.pageSetting.saveBtnLoading = false;
                        });
                    }else {
                        DictionaryAPI.update($scope.dictionary, function(data,headers){
                            $dialog.success("更新成功");
                            $scope.cancel();
                        }).$promise.finally(function(){
                            $scope.pageSetting.saveBtnLoading = false;
                        });
                    }
                });
            // }
        };
        $scope.cancel = function(){
            layer.close(layerIndex);
        };
        // 导出
        $scope.batchExport = function(){
            DictionaryAPI.export({
                data:{keyword: $scope.queryParam.keyword}
            });
        };
    }]
});
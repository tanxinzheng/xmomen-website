/**
 * Created by EX-WUPENGPENG001 on 2017-06-06.
 */
angular.module('uia'
).directive('btnLoading', [function () {
    return {
        restrict: 'A',
        scope:{
            btnLoadingText:'@',
            btnLoading:'='
        },
        link: function (scope, element, attr, ctrl) {
            var defaultLoadingText = attr.btnLoadingText || "请稍等";
            scope.insideHtml = element.html();
            scope.$watch('btnLoading', function (value,oldV) {
                if (angular.isDefined(value)) {
                    if(value){
                        element.attr('disabled', true);
                        element.html("<i class='fa fa-spin fa-spinner'></i>&nbsp;" + defaultLoadingText);
                    }else{
                        element.removeAttr('disabled');
                        element.html(scope.insideHtml);
                    }
                }
            });
        }
    }
}]).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
}).directive("btnClose",["uiaDialog", function($dialog){
    return {
        restrict:'E',
        replace:'true',
        template:'<button class="btn" type="button" ng-click="closeWindow()"><i class="icon-remove-sign">&nbsp;&nbsp;关闭</i></button>',
//        template:'<button class="btn" type="button" ng-click="closeWindow()" data-tooltip="关闭"><i class="icon-remove-sign">&nbsp;&nbsp;</i>关闭</button>',
        scope:{
            eventClick:'&',
            formName:'@',
            spreadName:'='
        },
        link:function (scope, elm, attrs, ctrl) {
            var formScope;
            var formEle = elm[0].form;
            if(formEle){
                formScope = angular.element(formEle).scope()[formEle.name];
            }
            scope.closeWindow = function(){
                var formName = scope.formName;
                if((formScope && formScope.$dirty) || (formName && scope.$parent
                    && scope.$parent[formName].$dirty) || spreadDirtyCheck()){
                    $dialog.confirm("存在已修改且未保存的数据，请确认是否关闭？").then(function(){
                        if(scope.eventClick){
                            scope.eventClick();
                        }
                        window.close();
                    })
                }else{
                    if(scope.eventClick){
                        scope.eventClick();
                    }
                    window.close();
                }
            };
            var spreadArray = scope.spreadName;
            var spreadDirtyCheck = function(){
                if(!scope.spreadName){
                    return false;
                }
                for (var i = 0; i < spreadArray.length; i++) {
                    var obj = spreadArray[i];
                    var spreadOption = scope.$parent[obj];
                    var row = spreadOption.spread.getActiveSheet().getDirtyRows();
                    if(row.length > 0){
                        return true;
                    }
                }
                return false;
            }
        }
    }
}]).directive('btnCancel',['uiaDialog',function($dialog){
    return{
        restrict:'E',
        replace:true,
        template:'<button class="btn" type="button" ng-click="click()"><i class="icon-undo">&nbsp;&nbsp;取消</i></button>',
        scope:{
            eventClick:'&',
            formName:'@',
            spreadName:'='
        },
        link: function(scope, element, attr, ngModel) {
            var formName = scope.formName;
            var formScope;
            var formEle = element[0].form;
            if(formEle){
                formScope = angular.element(formEle).scope()[formEle.name];
            }
            scope.click = function(){
                if((formScope && formScope.$dirty) || (formName && scope.$parent
                    && scope.$parent[formName].$dirty)){
                    $dialog.confirm("存在已修改且未保存的数据，请确认是否取消？").then(function(){
                        scope.eventClick();
                        element.parents('form').find('.error-popover').remove();
                        //element.parents('form').data('validator').resetForm();
                        if(formScope != undefined && formScope.$dirty){
                            formScope.$setPristine(true);
                        }
                        if(formName && scope.$parent[formName].$dirty){
                            scope.$parent[formName].$setPristine(true);
                        }
//                            if(spreadArray){
//                                cleanSpreadDirty();
//                            }

                    });
                }else{
                    scope.eventClick();
                    element.parents('form').find('.error-popover').remove();

                }
            };
//                var spreadArray = scope.spreadName;
//                var cleanSpreadDirty = function(){
//                    if(!scope.spreadName){
//                        return;
//                    }
//                    for (var i = 0; i < spreadArray.length; i++) {
//                        var obj = spreadArray[i];
//                        var spreadOption = scope.$parent[obj];
//                        if(spreadOption){
//                            var row = spreadOption.spread.getActiveSheet().getDirtyRows();
//                            if(row.length > 0){
//                                spreadOption.spread.getActiveSheet().clearPendingChanges();
//                            }
//                        }
//                    }
//                }
//                var spreadDirtyCheck = function(){
//                    if(!scope.spreadName){
//                        return false;
//                    }
//                    for (var i = 0; i < spreadArray.length; i++) {
//                        var obj = spreadArray[i];
//                        var spreadOption = scope.$parent[obj];
//                        if(spreadOption){
//                            var row = spreadOption.spread.getActiveSheet().getDirtyRows();
//                            if(row.length > 0){
//                                return true;
//                            }
//                        }
//                    }
//                    return false;
//                }
        }
    }
}]).directive("auditBtn", ['AuditService', 'uiaDialog', 'AuditAPI', function(AuditService, $dialog, AuditAPI) {
    return {
        restrict:"E",
        scope:{
            auditCallback:"=",
            auditType:"@",
            auditId:"=",
            auditStatus:"="
        },
        replace:true,
        template:'<div><button class="btn" type="button" ng-show="auditStatus" ng-click="viewHistory()"><i class="icon-eye-open">&nbsp;&nbsp;查看审核历史</i></button>' +
            '<button class="btn" type="button" ng-show="canReject" ng-click="rejectTransaction()"><i class="icon-edit">&nbsp;&nbsp;反审批</i></button>' +
            '<button class="btn" type="button" ng-show="canApprove" ng-click="approveTransaction()"><i class="icon-edit">&nbsp;&nbsp;审批</i></button>' +
            '<button class="btn" type="button" ng-show="canRevoke" ng-click="revokeTransaction()"><i class="icon-undo">&nbsp;&nbsp;撤销提交</i></button>' +
            '<button class="btn" type="button" ng-show="canSubmit" ng-click="submitTransaction()"><i class="icon-cloud-upload">&nbsp;&nbsp;提交</i></button></div>',
        link:function(scope,element,attr,ctrl){
            scope.$watch('auditStatus', function(newValue, oldValue) {
                scope.canReject = false;
                scope.canApprove = false;
                scope.canRevoke = false;
                scope.canSubmit = false;
                if (scope.auditId) {
                    if (scope.auditStatus == "3AUDITTING") {
                        AuditAPI.checkApprove({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canApprove = true;
                            }
                        });
                        AuditAPI.checkRevoke({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canRevoke = true;
                            }
                        });
                    } else if (scope.auditStatus == "4AUDITTED") {
                        AuditAPI.checkReject({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canReject = true;
                            }
                        });
                    } else if (scope.auditStatus == "1SAVED" || scope.auditStatus == "2SUBMITTED") {
                        AuditAPI.checkSubmit({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canSubmit = true;
                            }
                        });
                    }
                }
            });

            scope.approveTransaction = function() {
                AuditService.showApproveDialog(scope.auditType, scope.auditId, function(result) {
                    scope.canRevoke = false;
                    scope.canApprove = false;
                    AuditAPI.checkApprove({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                        if (result.permitted) {
                            scope.canApprove = true;
                        }
                    });
                    scope.auditCallback(result);
                });
            }

            scope.rejectTransaction = function() {
                AuditService.reject(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.revokeTransaction = function() {
                AuditService.revoke(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.submitTransaction = function() {
                AuditService.submit(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.viewHistory = function() {
                AuditService.viewHistory(scope.auditType, scope.auditId);
            }

        }
    }
}]).directive('btnAdd',[function(){
    return {
        restrict:'E',
        replace:true,
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-plus">&nbsp;&nbsp;新增</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attr,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnDelete',[function(){
    return {
        restrict:'E',
        replace:true,
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-trash">&nbsp;&nbsp;删除</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnView',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-eye-open">&nbsp;&nbsp;查看</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnSave',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="submit" class="btn" ng-click="click()"><i class="icon icon-ok">&nbsp;&nbsp;保存</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnEdit',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-edit">&nbsp;&nbsp;修改</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnRefresh',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-refresh">&nbsp;&nbsp;刷新</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click = function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnRevise',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-pencil">&nbsp;&nbsp;修订</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive("btnFilter",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-filter">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text='过滤'
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive("btnSearch",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="button" class="btn uia-btn {{class}}" ng-click="click()"><i class="icon icon-search">&nbsp;&nbsp;搜索</i></button>',
        scope:{
            eventClick:'&',
            loading:'=?',
            btnClass:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnClass){
                scope.class=attrs.btnClass;
            }else{
                scope.class='';
            };
            if(attrs.loading){
                scope.insideHtml = element.html();
                scope.$watch('loading',function(newV,oldV){
                    var defaultLoadingText = attrs.btnLoadingText || "<i class='icon-spinner'>&nbsp;稍等</i>";
                    if (angular.isDefined(newV)) {
                        if(newV){
                            element.attr('disabled', true);
                            element.html(defaultLoadingText);
                        }else{
                            element.removeAttr('disabled');
                            element.html(scope.insideHtml);
                        }
                    }
                })
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive("btnReset",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="reset" class="btn uia-btn {{class}}" ng-click="click()"><i class="icon icon-undo">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?',
            btnClass:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text='重置'
            }
            if(attrs.btnClass){
                scope.class=attrs.btnClass;
            }else{
                scope.class='';
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive('btnExport',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-upload-alt">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text="导出"
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnImport',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="handleClick()" ><i class="icon-download-alt">&nbsp;&nbsp;导入</i></button>',
        scope:{
            eventChange:'&',
            fileModel:'='
        },
        link:function(scope,element,attr,ctrl){
            scope.handleClick=function(){
                var clickCount=1;
                scope.$watch('fileModel',function(newV,oldV){
                    if(scope.fileModel){
                        if(newV &&newV!=oldV){
                            if(clickCount==1){
                                scope.eventChange();
                                clickCount++;
                            }
                        }
                    }
                })
            }
        }
    }
}]).directive('btnDownload',["$timeout", "$q", "uiaDialog", function ($timeout, $q, $dialog) {
    return {
        restrict: 'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="handleClick()"><i class="icon-cloud-download">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            btnText:"@",
            downloadUrl:"=",// 引用scope对象
            downloadParams:"=",// 参数对象
            downloadHref:"@"// 引用链接字符串下载(必须为全路径,如：http://localhost:8080/imsp/excel/demo.xle)
        },
        link: function (scope, element, attr) {
            if(attr.btnText){
                scope.text = attr.btnText;
            }else{
                scope.text = '下载模板';
            }
            scope.handleClick = function(){
                if(!attr.downloadUrl && !attr.downloadHref){
                    $dialog.alert("btn-down directive only choice one attribute: download-url or download-href.");
                }
                var defer = $q.defer();
                var anchor = angular.element("<iframe/>");
                anchor.attr({
                    style:"display:none",
                    src: function(){
                        var params = "";
                        if(attr.downloadParams){
                            for(var p in scope.downloadParams){
                                if(params == ""){
                                    params += "?" + p + '=' + encodeURIComponent(scope.downloadParams[p]);
                                }else{
                                    params += "&" + p + '=' + encodeURIComponent(scope.downloadParams[p]);
                                }
                            }
                        }
                        if(attr.downloadUrl){
                            return scope.downloadUrl + params;
                        }else if(attr.downloadHref){
                            return scope.downloadHref + params;
                        }
                    },
                    onLoad:function(){
                        $timeout(function(){
                            anchor.remove();
                        },50000);
                    }
                });
                angular.element("body").append(anchor);
                return defer.promise;
            };
        }
    }
}])
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').factory("uiaDialog", ["$q", "toaster", "$uibModal", "$timeout", function ($q, toaster, $uibModal, $timeout) {
    return {
        reload: function(option){
            var defaultConfig = {
                url: "/"
            };
            angular.extend(defaultConfig, option);
            var paramstr = "";
            if (option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(option.params[prop] !== null){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            window.location.href = defaultConfig.url + paramstr;
        },
        modal: function (option, style) {
            var defaultConfig = {
                url: "/"
            };
            angular.extend(defaultConfig, option);
            var paramstr = "";
            if (option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(angular.isDefined(option.params[prop])){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            if(option && option.id){
                option.id = option.id.replace('.','');
            }
            if(style){
                window.open(option.url + paramstr, '_blank' , style);
            }
            window.open(option.url + paramstr, '_blank', 'status,scrollbars=yes,resizable,left=10,top=0,width=1000,height=600');
//            var layerInstance = layer;
//            if(parent.layer){
//                layerInstance = parent.layer;
//            }
//            layerInstance.open({
//                title:option.title,
//                type: 2,
//                area: '860px',
//                fixed: false, //不固定
//                maxmin: true,
//                content: defaultConfig.url + paramstr,
//                success:function(dom, index){
//                    // 修复iframe高度
//                    var bodyFrame,
//                        bodyDom,
//                        layerDiv,
//                        layerFrame;
//                    bodyFrame = layer.getChildFrame('body', index);
//                    bodyDom = bodyFrame[0];
//                    layerFrame = $("#layui-layer-iframe" + index);
//                    layerDiv = $("#layui-layer" + index);
//                    layerDiv.height(bodyDom.scrollHeight);
//                    layerFrame.height(bodyDom.scrollHeight);
//                },
//                cancel: function(index){
//                    bodyFrame = layer.getChildFrame('body', index);
//                    //return false 开启该代码可禁止点击该按钮关闭
//                }
//            });
        },
        modalTab: function (option, style) {
            if (!option.id || !option.url || !option.name) {
                throw new Error("$dialog.modalTab parameter: 'id', 'url', 'name' property value must be not null");
            }
            var paramstr = "";
            if (option && option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(option.params[prop] !== null){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            if(option && option.id){
                option.id = option.id.replace('.','');
            }
            if(window.top.PortalTab){
                window.top.PortalTab.open(option.id, option.url + paramstr, option.name, null);
            }else{
                if(style){
                    window.open(option.url + paramstr, '_blank' , style);
                }
                window.open(option.url + paramstr, '_blank', 'status,scrollbars=yes,resizable,left=10,top=0,width=1000,height=600');
            }
        },
        alert: function (option) {
            var defaultConfig = {
                type:"info",
                //title: "提示",
                timeout: 5000,
                bodyOutputType: 'trustedHtml'
            };
            if (!angular.isObject(option)) {
                defaultConfig.text = option;
            }
            angular.extend(defaultConfig, option);
            toaster.pop(defaultConfig.type, defaultConfig.title, defaultConfig.text, defaultConfig.timeout, defaultConfig.bodyOutputType);
        },
        cancel: function(){
            return this.confirm("存在已修改且未保存的数据，是否确认关闭？");
        },
        confirm: function (msg, option) {
            var deferred,
                layerInstance;
            deferred = $q.defer();
            var config = {
                skin:"layui-layer-uia",
                btn: ['确认', '取消'] //按钮
            };
            if(option){
                config = angular.extend(config, option);
            }
            if(window.parent){
                layerInstance = parent.layer;
            }else{
                layerInstance = layer;
            }
            layerInstance.confirm(msg, config, function(index){
                layerInstance.close(index);
                deferred.resolve();
            }, function(index){
                layerInstance.close(index);
                deferred.reject();
            });
            return deferred.promise;
        }
    }
}]);
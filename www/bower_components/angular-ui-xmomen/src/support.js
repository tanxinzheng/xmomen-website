/**
 * Created by TANXINZHENG481 on 2017-06-08.
 */
angular.module('uia').factory("$UrlUtils", ["$location", function ($location) {
    return {
        getParameters: function () {
//            var params = {};
//            var obj = $location.search();
//            for (var key in obj) {
//                params[key] = obj[key];
//            }
//            return params;
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = {};
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for(var i = 0; i < strs.length; i ++) {
                    theRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        /**
         * 获取url参数字符串
         * @returns {{}}
         */
        getParamsUrlString: function () {
            var params = "";
            var obj = $location.search();
            for (var key in obj) {
                params += key + "=" + encodeURIComponent(obj[key]);
                params += "&";
            }
            params = params.substring(0,params.length-1);
            return "?" + params;
        }
    }
}]).factory('$dialog', ['uiaDialog', function(uiaDialog){
    // 兼容旧dialog
    return uiaDialog;
}]).factory('uiaResource', [ '$resource', '$q', "$timeout", function( $resource , $q, $timeout) {
    return function( url, params, methods ) {
        var defaults = {
            query: { method: "GET", isArray: false},
            update: { method: 'PUT' },
            remove: { method: 'DELETE' },
            create: { method: 'POST' }
        };

        methods = angular.extend( defaults, methods );

        var resource = $resource( "/api" + url, params, methods );

        resource.$export = function(option, success, fail) {
            var defer = $q.defer();
            var params = "";
            if(option && option.data){
                if(window.sessionStorage.token){
                    option.data.token = window.sessionStorage.token;
                }
                for(var p in option.data){
                    if(option.data[p]){
                        params += p + "=" + option.data[p] + "&";
                    }
                }
                params = "?"+params;
            }
            if(!option.data && window.sessionStorage.token){
                params = "?token=" + window.sessionStorage.token;
            }
            var anchor = angular.element("<iframe/>");
            anchor.attr({
                style:"display:none",
                src: option.url + params,
                onLoad:function(){
                    defer.resolve();
                    $timeout(function(){
                        anchor.remove();
                    }, 100000);
                }
            });
            angular.element("body").append(anchor);
            return defer.promise;
        };

        return resource;
    };
}]).factory('uiaFileUtils', [ '$resource', '$q', "$timeout", function( $resource , $q, $timeout) {
    return {
        download : function(option) {
            var defer = $q.defer();
            var params = "";
            if(option && option.data){
                for(var p in option.data){
                    if(option.data[p]){
                        params += p + "=" + option.data[p] + "&";
                    }
                }
                params = "?"+params;
            }
            var anchor = angular.element("<iframe/>");
            anchor.attr({
                style:"display:none",
                src: option.url + params,
                onLoad:function(){
                    defer.resolve();
                    $timeout(function(){
                        anchor.remove();
                    }, 100000);
                }
            });
            angular.element("body").append(anchor);
            return defer.promise;
        }
    }
}]).factory('HttpInterceptor', ["$q", "$injector", "TokenService", function ($q, $injector, TokenService) {
    var uiaMessage,
        $state,
        $dialog;
    return {
        request: function (config) {
            if(window.top.setSessionTimeout && angular.isFunction(window.top.setSessionTimeout)){
                window.top.setSessionTimeout(new Date().getTime());
            }
            if (config.method == 'GET') {
                if(config.headers['X-Requested-With'] == "XMLHttpRequest" && !config.cache){
                    if(config.params){
                        config.params._noCache = new Date().getTime();
                    }else {
                        config.params = {
                            noCache : new Date().getTime()
                        }
                    }
                }
            }
            return config;
        },
        responseError: function (response, data) {
            $dialog = $dialog || $injector.get("uiaDialog");
            uiaMessage = uiaMessage || $injector.get("uiaMessage");
            if (response.status >= 400  && response.status < 500 && response.status != 401) {
                $dialog.alert(response.data.message);
            }else if(response.status == 500){
                $dialog.alert("系统错误，请联系管理员");
            }else if(response.status == 401){
                TokenService.removeToken();
                uiaMessage.publish('unAuthentication');
            }
            return $q.reject(response);
        }
    }
}]).factory('TokenService', ["$q", "$window", function ($q, $window) {
    return {
        authentication: function () {
            var defer = $q.defer();
            if ($window.sessionStorage.token) {
                defer.resolve(true);
            }else{
                defer.reject(false);
            }
            return defer.promise;
        },
        removeToken: function () {
            delete $window.sessionStorage.token;
        }
    };
}]).factory('TokenInterceptor', ["$q", "$window", function ($q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = $window.sessionStorage.token;
            }
            return config;
        },
        response: function (response) {
            return response || $q.when(response);
        }
    };
}]).config(['$httpProvider', '$qProvider', function ($httpProvider, $qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.interceptors.push('TokenInterceptor');
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);
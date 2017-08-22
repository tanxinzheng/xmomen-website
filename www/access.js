var ApiPrefix = "/api";
angular.module('accessApp',[
    'ngResource', 'ui.router', 'uia', 'ui.bootstrap'
]).factory("AccessAPI", ["uiaResource", function(Resource){
    return Resource("/account/:id", { id:"@id" }, {
        findPassword: {
            method:"PUT",
            url:ApiPrefix + "/access/find_password",
            params:{
                type:"@type",
                receiver:"@receiver",
                password:"@password",
                code:"@code",
            }
        },
        login: {
            method:"POST",
            url: ApiPrefix + "/login",
            headers : {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function (data, headersGetter) {
                var str = [];
                for(var p in data){
                    if(p && data[p]){
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                    }
                }
                return str.join("&");
            }
        },
        sendCode: {
            url:"/access/code",
            method:"POST",
            isArray:false,
            params:{
            type:"@type",
            receiver:"@receiver",
        }},
        logout: {
            url: ApiPrefix + "/logout"
        },
        register: {
            method:"POST",
            url:ApiPrefix + "/access/register"
        }
    });
}]).controller('AccessAppCtrl', ['$scope', function ($scope) {

}]).controller('findPasswordCtrl', ['$scope', '$http', '$state', 'AccessAPI', '$interval', function($scope, $http, $state, AccessAPI, $interval) {
    $scope.pageSetting = {
        message:"发送验证码",
        type:1
    }
    $scope.user = {};
    $scope.loading = false;
    $scope.resetPassword = function(){
        if(!$scope.findPassword.validate()){
            return;
        }
        var receiver;
        if($scope.pageSetting.type == 1){
            receiver = $scope.user.phone;

        }else if($scope.pageSetting.type == 2){
            receiver = $scope.user.email;
        }
        $scope.loading = true;
        AccessAPI.findPassword({
            type:$scope.pageSetting.type,
            receiver:receiver,
            code:$scope.user.code,
            password:$scope.user.password
        }, function (data) {
            var i = 5;
            var timer = $interval(function () {
                i--;
                $scope.pageSetting.tip = "密码已重置成功，" + i + '秒后自动跳转至登录页面';
                if(i == 0){
                    $interval.cancel(timer);
                    $state.go('access.signin')
                }
            }, 1000);
        }).finally(function () {
            $scope.loading = false;
        })
    };
    $scope.sendCode = function(){
        var receiver = null;
        if($scope.pageSetting.type == 1){
            if(!$scope.findPassword.validateElement($("#phone")) ||
                !$scope.findPassword.validateElement($("#password")) ||
                !$scope.findPassword.validateElement($("#repeatPassword"))){
                return;
            }
            receiver = $scope.user.phone;

        }else if($scope.pageSetting.type == 2){
            if(!$scope.findPassword.validateElement($("#email")) ||
                !$scope.findPassword.validateElement($("#password")) ||
                !$scope.findPassword.validateElement($("#repeatPassword"))){
                return;
            }
            receiver = $scope.user.email;
        }
        AccessAPI.sendCode({
            type: $scope.pageSetting.type,
            receiver: receiver
        }, function(data){
            $scope.pageSetting.disabledSendCode = true;
            var i = 60;
            var intervalCode = $interval(function () {
                i--;
                $scope.pageSetting.message = i + '秒';
                if(i == 0){
                    $interval.cancel(intervalCode);
                    $scope.pageSetting.disabledSendCode = false;
                    $scope.pageSetting.message = "发送验证码";
                }
            }, 1000);
        })
    }
}]).controller('loginCtrl', ['$scope', '$http', '$state', "AccessAPI", "$window", function($scope, $http, $state, AccessAPI, $window) {
    $scope.user = {};
    $scope.login = function() {
        $scope.form.isLoading = true;
        AccessAPI.login({
            username: $scope.user.username,
            password: $scope.user.password,
            rememberMe: $scope.user.rememberMe,
        }).$promise.then(function(data) {
            $window.sessionStorage.token = data.token;
            window.location.href = "/index.html";
        }).finally(function(){
            $scope.form.isLoading = false;
        });
    };
}]).controller('registerCtrl', ['$scope', '$http', '$state', 'AccessAPI', '$interval', function($scope, $http, $state, AccessAPI, $interval) {
    $scope.pageSetting = {
        message:"发送验证码",
        type:1
    }
    $scope.user = {};
    $scope.loading = false;
    $scope.register = function(){
        if(!$scope.form.validate()){
            return;
        }
        if($scope.pageSetting.type == 1){
            $scope.user.type = 1;
        }else if($scope.pageSetting.type == 2){
            $scope.user.type = 2;
        }
        $scope.loading = true;
        AccessAPI.register($scope.user, function (data) {
            var i = 5;
            var timer = $interval(function () {
                i--;
                $scope.pageSetting.tip = "注册成功，" + i + '秒后自动跳转至登录页面';
                if(i == 0){
                    $interval.cancel(timer);
                    $state.go('access.signin')
                }
            }, 1000);
        }).finally(function () {
            $scope.loading = false;
        })
    };
    $scope.sendCode = function(){
        var receiver = null;
        if($scope.pageSetting.type == 1){
            if(!$scope.form.validateElement($("#phone")) ||
                !$scope.form.validateElement($("#password")) ||
                !$scope.form.validateElement($("#repeatPassword"))){
                return;
            }
            receiver = $scope.user.phone;

        }else if($scope.pageSetting.type == 2){
            if(!$scope.form.validateElement($("#email")) ||
                !$scope.form.validateElement($("#password")) ||
                !$scope.form.validateElement($("#repeatPassword"))){
                return;
            }
            receiver = $scope.user.email;
        }
        AccessAPI.sendCode({
            type: $scope.pageSetting.type,
            receiver: receiver
        }, function(data){
            $scope.pageSetting.disabledSendCode = true;
            var i = 60;
            var intervalCode = $interval(function () {
                i--;
                $scope.pageSetting.message = i + '秒';
                if(i == 0){
                    $interval.cancel(intervalCode);
                    $scope.pageSetting.disabledSendCode = false;
                    $scope.pageSetting.message = "发送验证码";
                }
            }, 1000);
        })

    }
}]).config(['$stateProvider', '$stateProvider', '$urlRouterProvider', function ($stateProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .otherwise('/access/signin');
    var states = [];
    states.push({
        name: 'access',
        url: '/access',
        template: '<div ui-view class="fade-in-right-big smooth"></div>'
    });

    states.push({
        title: "登录",
        name:"access.signin",
        url: '/signin',
        ignoreAuth:true,
        templateUrl: 'modules/basic/signin.html',
        controller: 'loginCtrl'
    });

    states.push({
        title: "注册",
        name:"access.signup",
        url: '/signup',
        templateUrl: 'modules/basic/signup.html',
        controller: 'registerCtrl'
    });

    states.push({
        title: "找回密码",
        name:"access.find_password",
        url: '/find_password',
        templateUrl: 'modules/basic/find_password.html',
        controller: 'findPasswordCtrl'
    });

    angular.forEach(states, function(state){
        $stateProvider.state(state.name, state);
    });
}]);

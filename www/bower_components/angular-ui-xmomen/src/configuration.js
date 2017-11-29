/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').factory('uiaConfig', [function(){
    return {
        loginUrl:"/login",
        logoutUrl:"/logout",
        accountInfoUrl:"/account",
        menuUrl:"/nav/menu",
        api:"http://localhost:8081"
    };
}]);
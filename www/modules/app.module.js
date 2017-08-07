/**
 * Created by tanxinzheng on 16/9/15.
 */
define([
    "angular",
    "modules/app.api",
    "modules/app.controller",
    "modules/basic/basic.module"
],function (angular, app, appController) {
    return angular.module("app.module", [
        "basic.module",
        "App.REST",
        // "authorization.module",
        // "system.module",
        // "user.module"
    ]).controller('AppCtrl', appController);
});
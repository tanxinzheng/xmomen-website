/**
 * Created by tanxinzheng on 17/1/15.
 */
require([
    "angular",
    "angularAMD",
    "app"
    //"./bower_components/angular/angular.min",
    //"./bower_components/angularAMD/angularAMD",
    //"./js/app.define"
], function (angular, angularAMD, app) {
    angular.element(document).ready(function() {
        $.get('/account/permissions', function(data) {
            var permissionList = data;
            angularAMD.bootstrap(app);
        });
    });
});
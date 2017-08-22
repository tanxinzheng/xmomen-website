/**
 * Created by tanxinzheng on 17/8/7.
 */
define(function () {
    return ['$scope', '$window',"$rootScope", "$http", "$state", "AppAPI", "AccountAPI", "TokenService", "uiaMessage", "PermPermissionStore", "$urlRouter",
        function($scope,  $window, $rootScope, $http, $state, AppAPI, AccountAPI, TokenService, uiaMessage, PermPermissionStore, $urlRouter) {

            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

            // config
            $rootScope.app = {
                name: '模板开发平台',
                version: '1.3.3',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info:    '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger:  '#f05050',
                    light:   '#e8eff0',
                    dark:    '#3a3f51',
                    black:   '#1c2b36'
                },
                settings: {
                    themeID: 1,
                    navbarHeaderColor: 'bg-black',
                    navbarCollapseColor: 'bg-white-only',
                    asideColor: 'bg-black',
                    headerFixed: true,
                    asideFixed: false,
                    asideFolded: false,
                    asideDock: false,
                    container: false,
                    showTabs: false
                },
                logout:"/api/logout"
            };

            $rootScope.lock = function(){
                window.sessionStorage.isLocked = true;
                $state.go('lock');
            };

            $rootScope.logout = function(){
                AppAPI.logout({}).$promise.then(function(){
                    TokenService.removeToken();
                    window.location.href = "/access.html";
                })
            };

            $scope.getAccountInfo = function () {
                TokenService.authentication().then(function () {
                    AccountAPI.getAccount({}, function(data){
                        $rootScope.account = data;
                    }, function () {
                        $rootScope.account = null;
                    })
                })
            }

            uiaMessage.subscribe('refreshAccount', function () {
                $scope.getAccountInfo();
                // uiaMessage.publish("refreshPermission")
            });

            uiaMessage.subscribe('refreshPermission', function () {
                TokenService.authentication().then(function () {
                    AccountAPI.getPermissions({}, function(resp){
                        PermPermissionStore.defineManyPermissions(resp.permissions, function(permissionName, data){
                            return angular.contains(data.permissions, permissionName);
                        });
                    }).$promise.then(function(){
                        // Once permissions are set-up
                        // kick-off router and start the application rendering
                        $urlRouter.sync();
                        // Also enable router to listen to url changes
                        $urlRouter.listen();
                    });
                }, function () {
                    PermPermissionStore.clearStore();
                });
            });

            var init = function(){
                $scope.getAccountInfo();
            };
            init();

            //  save settings to local storage
            // if ( angular.isDefined($localStorage.settings) ) {
            //     $scope.app.settings = $localStorage.settings;
            // } else {
            //     $localStorage.settings = $scope.app.settings;
            // }
            $scope.$watch('app.settings', function(){
                if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
                    // aside dock and fixed must set the header fixed.
                    $scope.app.settings.headerFixed = true;
                }
                // save to local storage
                // $localStorage.settings = $scope.app.settings;
            }, true);

            function isSmartDevice( $window ){
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }
        }]
})
/**
 * Created by tanxinzheng on 16/8/12.
 */
define(function () {
    return ["$scope", "AccountAPI", "$uibModal", function($scope, AccountAPI, $uibModal){
        $scope.user = {};
        var getAccountInfo = function(){
            AccountAPI.getAccount({}, function(data){
                $scope.user = data;
            });
        }
        $scope.openAvatar = function(){
            $uibModal.open({
                templateUrl: 'update_avatar.html',
                modal:true,
                size:"lg",
                resolve: {
                    deps: ['$$animateJs', '$ocLazyLoad',function( $$animateJs, $ocLazyLoad){
                        return $ocLazyLoad.load('ngImgCrop');
                    }]
                },
                controller: ['$scope', '$uibModalInstance', "$timeout", "AccountAPI",
                    function($scope, $uibModalInstance, $timeout, AccountAPI){
                        $scope.cancel = function(){
                            $uibModalInstance.dismiss();
                        };
                        $scope.avatarImage = '';
                        $scope.croppedImage = '';
                        var handleFileSelect = function(evt) {
                            var file = evt.currentTarget.files[0];
                            var reader = new FileReader();
                            reader.onload = function (evt) {
                                $scope.$apply(function($scope){
                                    $scope.avatarImage =evt.target.result;
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        $scope.doUpload = function () {
                            if($scope.croppedImage == ''){
                                $dialog.alert('请选择上传的图片');
                                return
                            }
                            var $Blob = getBlobByDataURL($scope.croppedImage, "image/png");
                            $scope.loading = true;
                            AccountAPI.updateAvatar({
                                file:$Blob
                            }).then(function (data) {
                                $uibModalInstance.close();
                            }).finally(function () {
                                $scope.loading = false;
                            })
                        };
                        var getBlobByDataURL = function (dataURI,type){
                            var binary = atob(dataURI.split(',')[1]);
                            var array = [];
                            for(var i = 0; i < binary.length; i++) {
                                array.push(binary.charCodeAt(i));
                            }
                            return new Blob([new Uint8Array(array)], { type: type });
                        }
                        $timeout(function () {
                            angular.element($('#fileInput')).on('change', handleFileSelect);
                        })
                    }]
            }).result.then(function () {
                getAccountInfo();
            });
        }
        var init = function () {
            getAccountInfo();
        }
        init();
    }];
});
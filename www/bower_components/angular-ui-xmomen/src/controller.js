/**
 * Created by TANXINZHENG481 on 2017-06-09.
 */
angular.module('uia').controller('AppUIACtrl', ['$scope', '$uibModal', 'uiaDialog','$timeout', '$interval',
    '$http', 'uiaConfig', '$rootScope',
function($scope, $uibModal, $dialog, $timeout, $interval, $http, uiaConfig, $rootScope){
    $rootScope.logOutUrl = uiaConfig.logoutUrl;
    $scope.appSetting = {
        aside:false,
        activeAside:false,
        menuToggler:false,
        showTabScroll:false,
        showFootprints:false,
        tabNav:true
    };
    //页面提示信息位置
    $scope.toasterOptions = {
        "position-class":"toast-bottom-right",
        "close-button":true
    }
    // 切换主题
    $scope.userSet=function(){
        $uibModal.open({
            templateUrl: 'user-setting-modal.html',
            resolve : {
                userSetting : function () {
                    if(localStorage.getItem('userSettings')){
                        var userSettings= JSON.parse(localStorage.getItem('userSettings'));
                        return userSettings;
                    }else{
                        return {
                            theme:'lightBlue',
                            tabNav:true
                        };
                    }
                }
            },
            size:"",
            windowClass:"user-setting-modal",
            controller: ["$scope", "$uibModalInstance","userSetting",function ($scope, $uibModalInstance,userSetting){
                $scope.userTheme=userSetting.theme;
                $scope.themesList=[
                    //梦之蓝，海之蓝，天之蓝，春意盎然，绿树成荫，秋高气爽，冬日暖阳 >>主题色，浅一级主题色，浅二级，tab导航/浅四级
                    {name:'blue-dream',colors:[{color:'#015d79'},{color:'#126e8a'},{color:'#237f9b'},{color:'#45a1bd'}]},
                    {name:'blue-ocean',colors:[{color:'#057ea5'},{color:'#168fb6'},{color:'#27a0c7'},{color:'#49c2e9'}]},
                    {name:'blue-sky',colors:[{color:'#3296b7'},{color:'#43a7c8'},{color:'#54b8d9'},{color:'#76dafb'}]},
                    {name:'spring',colors:[{color:'#69a059'},{color:'#7ab16a'},{color:'#8bc27b'},{color:'#ade49d'}]},
                    {name:'summer',colors:[{color:'#367725'},{color:'#478836'},{color:'#589947'},{color:'#7abb69'}]},
                    {name:'vitality-orange',colors:[{color:'#b35121'},{color:'#c46232'},{color:' #d57343'},{color:'#e68454'}]},
                    {name:'autumn',colors:[{color:'#9c6d4b'},{color:'#ad7e5c'},{color:'#be8f6d'},{color:'#e0b18f'}]},
                    {name:'winter',colors:[{color:'#827e6b'},{color:'#938f7c'},{color:'#a4a08d'},{color:'#c6c2af'}]},
                    {name:'chinese-red',colors:[{color:'#bf4444'},{color:'#D05555'},{color:'#e16666'},{color:'#f27777'}]},
                    {name:'light-blue',colors:[{color:'#D1E2FF'},{color:'#E0ECFF'},{color:'#EDF4FF'},{color:'#F6FAFF'}]}

                ];
                angular.forEach($scope.themesList,function(obj,array,index){
                    if(obj.name==$scope.userTheme){
                        $scope.current=obj;
                    }
                });
                $scope.choice=function(obj){
                    $scope.current=obj;
                }
                //******开关***********
                $scope.switch=function(){
                    $scope.switchType?$scope.switchType=false:$scope.switchType=true;
                }

                $scope.yes = function(){
                    $uibModalInstance.close({
                        theme:$scope.current,
                        tabNav:$scope.switchType
                    });
                };
                $scope.no = function(){
                    $uibModalInstance.dismiss();
                };
                function init(){
                    //初始化时足迹为关闭状态
                    if(userSetting.tabNav!=undefined && userSetting.tabNav!=null){
                        $scope.switchType=userSetting.tabNav;
                    }else{
                        $scope.switchType=true;
                    }

                }
                init()
            }]
        }).result.then(function(result){
                if(result){
                    var userTheme=result.theme.name;
                    var userSetting={};
                    userSetting['theme']=userTheme;
                    userSetting['tabNav']=result.tabNav;
                    var setting= JSON.stringify(userSetting);
                    localStorage.setItem('userSettings',setting);
                    window.location.reload();
                };
            });
    };
    //判断tab里li的总宽度和
    var monitorTabLiWidthSum=function(){
        var TabLiWidthtotal = 0;
        angular.forEach(angular.element('#breadcrumbs .tab-header'),function(obj,array,index){
            TabLiWidthtotal+=obj.offsetWidth;
        });
        return TabLiWidthtotal;
    };
    //判断是否显示左右滚动按钮
    var judgeShowTabScroll=function(params){
        $scope.viewWidth = angular.element('#breadcrumbs').eq(0).width()-72;
        $scope.tabLiWidth = monitorTabLiWidthSum();
        if($scope.tabLiWidth>$scope.viewWidth){
            $scope.showTabScroll=true;
            if(!params){
                angular.element('#breadcrumb').animate({left : $scope.viewWidth - $scope.tabLiWidth-28 + 'px'},200,'linear');
            }
        }else{
            $scope.showTabScroll=false;
            angular.element('#breadcrumb').animate({left : 0 + 'px'},200,'linear');
        }
    };
    //初始化焦点给首页
    $scope.navActive = uiaConfig.homeNav.id
    //打开tab页
    $scope.openTab = function(tabId, url, title){
        $scope.navActive = tabId;
        if(!hasTabId(tabId)){
            $scope.tabs.push({
                name:title,
                id:tabId,
                src:url
            });
            console.log("title:", title , "tabId:", tabId, "Url:", url);
            if(!$scope.appSetting.footprints){
                var t=$timeout(function(){
                    //打开新页面时监听tabLi的宽度，确定是否显示左右控制按钮
                    judgeShowTabScroll();
                    clearTimeout(t);

                },20)
            }
            //打开新页面时监听tab标签是否在收藏夹中
            judgeTabCollected();
        }
    };
    //改变焦点tab页
    $scope.changeCurrentTab = function(tab){
        $scope.navActive = tab.id;
    };
    //判断页面是否已经打开
    var hasTabId = function(id){
        for (var i = 0; i < $scope.tabs.length; i++) {
            var obj = $scope.tabs[i];
            if(obj.id == id){
                return true;
            }
        }
        return false;
    };
    //初始化tab导航
    $scope.tabs = [];

    $scope.tabs.push(uiaConfig.homeNav)    //移除Tab标签
    var removeTab = function(tabId) {
        if (tabId == uiaConfig.homeNav.id) {
            $dialog.alert("首页不能关闭");
            return;
        }
        for (var i = 0; i < $scope.tabs.length; i++) {
            var obj = $scope.tabs[i];
            if (obj.id == tabId) {
                $scope.tabs.splice(i, 1);
            }
        }
        $scope.navActive = $scope.tabs[$scope.tabs.length - 1].id;
        if (!$scope.appSetting.footprints) {
            $timeout(function () {
                //关闭页面时监听tabLi的宽度，确定是否显示左右控制按钮
                judgeShowTabScroll('close');
            }, 30)
        }
    };
    //关闭所有Tab标签
    $scope.closeAllTab = function(){
        $dialog.confirm("是否关闭所有标签").then( function(){
            $scope.tabs.splice(1, $scope.tabs.length - 1);
            $scope.navActive = uiaConfig.homeNav.id;
        })
    };
    //关闭tab标签，要判断其内部页面是否有未保存数据
    $scope.closeTabByTabId = function(tabId){
        if(!tabId){
            return;
        }
        // 获取子窗口iframe对象
        var iframe = angular.element('#tabIFrame_' + tabId)[0];
        var formele=iframe.contentWindow.angular ? iframe.contentWindow.angular.element("form") : null;
        var elem = iframe.contentWindow.angular ? iframe.contentWindow.angular.element("#content") : null;
        if(formele && formele.length>0){
            for(i=0;i<formele.length;i++){
                var obj=formele.eq(i);
                var formScope = null;
                if(obj.scope() && obj.scope()[obj[0].name]){
                    formScope = obj.scope()[obj[0].name];
                }
                if(formScope && formScope.$dirty && !formScope.ignoreTip){
                    $dialog.confirm("编辑状态存在已修改且未保存的数据，是否确认关闭？").then(function(){
                        if (elem && elem.scope() && elem.scope().childrenTabClose){
                            elem.scope().childrenTabClose(tabId);
                        } else {
                            removeTab(tabId);
                        }
                    });
                    return;
                }else{
                    removeTab(tabId);
                }
            }
        }else{
            if(elem && elem.scope() && elem.scope().checkUpdatedForm && elem.scope().checkUpdatedForm.$dirty){
                $dialog.confirm("编辑状态存在已修改且未保存的数据，是否确认关闭？").then(function(){
                    removeTab(tabId);
                });
                return;
            }else{
                removeTab(tabId);
            }
        }
    };
    //关闭其它标签页
    $scope.closeOtherTab=function(item){
        $dialog.confirm("确定关闭其它所有标签").then( function(){
            $scope.rootTabs=[uiaConfig.homeNav];
            if(item.id != uiaConfig.homeNav.id){
                $scope.rootTabs.push(item);
            }
            $scope.tabs=$scope.rootTabs;
            angular.element('#breadcrumb').animate({left : 0 + 'px'},200,'linear');
            $scope.navActive=tabId;

        })
    };
    //定义父页面事件。子页面调父页面关闭页面
    window.PortalTab = {
        open:function(tabId, url, title){
            $scope.$apply(function(){
                $scope.openTab(tabId, url, title)
            })
        },
        removeTabByTabId:function(tabId){
            $scope.$apply(function(){
                $scope.closeTabByTabId(tabId)
            })
        }

    };
    //crumb左右移动
    //$scope.breadcrumbMove=function(point){
    //    var crumbTabs= angular.element('#breadcrumb').css('left');
    //    var crumbTabsLeft= parseInt(crumbTabs.slice(0,crumbTabs.length-2));
    //    var difference=$scope.viewWidth - $scope.tabLiWidth;
    //   if($scope.showTabScroll) {
    //        if(point=='left'){
    //            if(crumbTabsLeft < -200){
    //                angular.element('#breadcrumb').animate({left : crumbTabsLeft+200 + 'px'},300);
    //            }else if(-200<=crumbTabsLeft&&crumbTabsLeft<=0){
    //                angular.element('#breadcrumb').animate({left : 0 + 'px'},300);
    //            }
    //        }else if(point=='right'){
    //            if(crumbTabsLeft>difference){
    //                if(crumbTabsLeft-200>difference){
    //                    angular.element('#breadcrumb').animate({left : crumbTabsLeft-200 + 'px'},300);
    //                }else if(crumbTabsLeft-200<=difference){
    //                    angular.element('#breadcrumb').animate({left : difference-28 + 'px'},300);
    //                }
    //            }
    //        }
    //   }
    //};
    $scope.breadcrumbMove=function(point,param){
        var aniTime;
        if(param){
            param=param;
            aniTime=0;
        }else{
            param=240;
            aniTime=200;
        }
        var crumbTabs= angular.element('#breadcrumb').css('left');
        var crumbTabsLeft= parseInt(crumbTabs.slice(0,crumbTabs.length-2));
        var difference=$scope.viewWidth - $scope.tabLiWidth;
        if($scope.showTabScroll) {
            if(point=='left'){
                if(crumbTabsLeft < -param){
                    angular.element('#breadcrumb').animate({left : crumbTabsLeft+param + 'px'},aniTime,'linear');
                }else if(crumbTabsLeft >= -param && crumbTabsLeft <=0){
                    angular.element('#breadcrumb').animate({left : 0 + 'px'},aniTime,'linear');
                }
            }else if(point=='right'){
                if(crumbTabsLeft>difference){
                    if(crumbTabsLeft-param>difference){
                        angular.element('#breadcrumb').animate({left : crumbTabsLeft-param + 'px'},aniTime,'linear');
                    }else if(crumbTabsLeft-param<=difference){
                        angular.element('#breadcrumb').animate({left : difference-28 + 'px'},aniTime,'linear');
                    }
                }
            }
        }
    }
    //$scope.tabNavFocus=false;
    //鼠标在Tab导航里滚动滚轮，tab标签会左右移动
    function HandleScroll(e){
        var e=e||window.event;
        e.preventDefault();
        if(e.wheelDelta){
            if($scope.showTabScroll){
                if(e.wheelDelta>0){
                    $scope.breadcrumbMove('left',e.wheelDelta);
                }else if(e.wheelDelta<0){
                    var count=-e.wheelDelta/120;
                    $scope.breadcrumbMove('right',-e.wheelDelta);
                }
            }
        }
    }
    $scope.scrollEvent=function(bool,$event){
        if(bool){
            $event.target.addEventListener('mousewheel',HandleScroll,false);
            //window.onmousewheel=document.onmousewheel=HandleScroll;
        }else{
            $event.target.removeEventListener('mousewheel',HandleScroll,false);
        }
    }

    //收藏页面
    $scope.collectTabs=[];
    $scope.collectTab=function(tab){
        if(tab){
            if(!tab['collected']){
                tab['collected']=true;
                $scope.collectTabs.push(tab);
                setCollectTabs($scope.collectTabs);
                $dialog.alert('成功添加收藏');
            }else if(tab['collected']){
                tab['collected']=false;
                angular.forEach($scope.collectTabs,function(obj,index,array){
                    if(obj.id==tab.id){
                        $scope.collectTabs.splice(index,1);
                        setCollectTabs($scope.collectTabs);
                        $dialog.alert('已取消收藏');
                    }
                })
            }


        }
    };
    //在本地存储里存放收藏的数据
    function setCollectTabs(data){
        var userCollection={};
        userCollection['tab']=data;
        var userCollections= JSON.stringify(userCollection);
        localStorage.setItem('userCollections',userCollections);
    }
    //获取收藏信息
    function getCollectTabs(param){
        if(localStorage.getItem('userCollections')){
            var userCollections= JSON.parse(localStorage.getItem('userCollections'));
            console.log(userCollections);
            $scope.collectTabs=userCollections['tab'];
        }
        if(param){
            judgeTabCollected();
        }
    }
    function judgeTabCollected(){
        if($scope.collectTabs.length){
            angular.forEach($scope.tabs,function(obj,index,array){
                obj['collected']=false;
                angular.forEach($scope.collectTabs,function(member,index,array){
                    if(obj.id==member.id){
                        obj['collected']=true;
                    }
                })
            })
        }else{
            angular.forEach($scope.tabs,function(member,index,array){
                member['collected']=false;
            })
        }
    }
    //弹窗选择已收藏的页面
    $scope.myCollections=function(){
        $uibModal.open({
            templateUrl:'user-collections.html',
            resolve:{
                collectTabs:function(){
                    return $scope.collectTabs
                }
            },
            size:'',
            windowClass:'user-setting-modal user-collections',
            controller:['$scope','$uibModalInstance','collectTabs','$timeout', function($scope, $uibModalInstance, collectTabs, $timeout){
                $scope.collectTabs=angular.copy(collectTabs);
                $scope.currentList=[];
                $scope.removeCollection=function(item,$event){
                    $event.stopPropagation();
                    item.unCollected=true;
                    var t=$timeout(function(){

                        angular.forEach($scope.collectTabs,function(obj,index,array){
                            if(obj.id==item.id){
                                $scope.collectTabs.splice(index,1);
                                //存，取，(取的时候传参数则，取完之后自动判断)
                                setCollectTabs($scope.collectTabs);
                                getCollectTabs(true);
                            }
                        });
                        $timeout.cancel(t);
                    },100)
                };
                $scope.choice=function(item){
                    item.choiced=!item.choiced;
                };
                $scope.choiceSave=function(item){
                    $scope.currentList=[];
                    $scope.currentList.push(item);
                    $uibModalInstance.close($scope.currentList);
                }
                $scope.addCurrentList=function(){
                    angular.forEach($scope.collectTabs,function(obj,index,array){
                        if(obj.choiced){
                            $scope.currentList.push(obj);
                        }
                    })
                };
                $scope.clearAll=function(){
                    if($scope.collectTabs.length){
                        $dialog.confirm('确定清空收藏夹').then(function(){
                            $scope.collectTabs=[];
                            setCollectTabs($scope.collectTabs);
                            getCollectTabs(true);
                            var t=$timeout(function(){
                                $uibModalInstance.dismiss();
                                $dialog.alert('已清空收藏夹');
                                $timeout.cancel(t);
                            },500)
                        })
                    }
                };
                $scope.yes = function(){
                    $scope.addCurrentList();
                    $uibModalInstance.close($scope.currentList);
                };
                $scope.no = function(){
                    $uibModalInstance.dismiss();
                };
            }]

        }).result.then(function(data){
                if(data.length>0){
                    angular.forEach(data,function(obj,index,arry){
                        angular.forEach($scope.tabs,function(member,index,array){
                            if(obj.id!=member.id){
                                $scope.openTab(obj.id, obj.src, obj.name);
                            }
                        })
                    })
                }
            })
    }
    //刷新页面
    $scope.refresh=function(tab){
        document.getElementById('tabIFrame_'+tab.id+'').contentWindow.location.reload(true)
    }
    //监测tabNav是否显示或隐藏
    var judgeTabNav=function(){
        if(localStorage.getItem('userSettings')) {
            var userSettings = JSON.parse(localStorage.getItem('userSettings'));
            if (userSettings.tabNav) {
                $scope.appSetting.tabNav=true;
            } else if (!userSettings.tabNav){
                $scope.appSetting.tabNav=false;
            }
        }
    }
    //*********************查看我的权限*******************
    $scope.myAuthority=function(){
        var myauthorities={
            src:"./account/account.jsp",
            id:"41042519920422",
            name:"我的账户"
        };
        $scope.openTab(myauthorities.id,myauthorities.src,myauthorities.name);
    };
    //初始化
    var init = function(){
        judgeTabNav();
        //定义父页面window事件，报表要用
        window.removeTab = removeTab;
        //初始化获取收藏页面，并判断
        getCollectTabs(true);
    };
    init();
}]);
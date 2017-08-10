define(function(){
    return ["$scope",  "ScheduleTaskAPI", "uiaDialog", "$injector", "$uibModal", "$timeout", function($scope, ScheduleTaskAPI, uiaDialog, $injector, $uibModal, $timeout){
        $scope.gridOption = {
            id:"user",
            title:'权限',
            loadEvent: ScheduleTaskAPI.query,
            ApiService: ScheduleTaskAPI,
            // 过滤条件列配置
            filters:[
                { name:'keyword', title:'关键字', placeholder:'请输入关键字' }
            ],
            showRemoveBtn:false,
            showViewBtn:false,
            showAddBtn:false,
            columns:[
                { name:'jobName', title:'任务名称' },
                { name:'jobGroup', title:'任务组' },
                { name:'description', title:'描述'},
                { name:'cronExpression', title:'CronExpression' },
                { name:'nextFireTime', title:'下次执行时间' , type:'date' },
                { name:'triggerStateName', title:'触发器状态' }
            ],
            buttons:[
                {
                    icon: "icon-control-pause",
                    title:"暂停",
                    show: function (event, item) {
                        return item.triggerState == 'ACQUIRED' ? true : false;
                    },
                    click: function (event, item) {
                        ScheduleTaskAPI.update({
                            jobName:item.jobName,
                            action:2
                        }, function () {
                            $scope.gridOption.refresh();
                        })
                    }
                },
                {
                    icon: "icon-control-play",
                    title:"启动",
                    show: function (event, item) {
                        return item.triggerState == 'PAUSED' ? true : false;
                    },
                    click: function (event, item) {
                        ScheduleTaskAPI.update({
                            jobName:item.jobName,
                            action:1
                        }, function () {
                            $timeout(function () {
                                $scope.gridOption.refresh();
                            }, 2000)
                        })
                    }
                },
                {
                    icon: "fa fa-repeat",
                    title:"重启",
                    click: function (event, item) {
                        ScheduleTaskAPI.update({
                            jobName:item.jobName,
                            action:3
                        }, function () {
                            $timeout(function () {
                                $scope.gridOption.refresh();
                            }, 2000)
                        })
                    }
                },
                {
                    icon: "fa fa-circle",
                    title:"运行",
                    tooltipTitle:"立即执行一次任务",
                    click: function (event, item) {
                        ScheduleTaskAPI.update({
                            jobName:item.jobName,
                            action:4
                        }, function () {
                            $scope.gridOption.refresh();
                        })
                    }
                }
            ]
        };
    }]
});
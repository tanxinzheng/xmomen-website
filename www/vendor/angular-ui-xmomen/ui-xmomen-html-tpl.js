(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/choice.html',
    '<div class="widget-choice">\n' +
    '    <div class="modal-header">\n' +
    '        <h5 class="modal-title">{{option.title}}</h5>\n' +
    '    </div>\n' +
    '    <div class="modal-body" style="min-height: 300px">\n' +
    '        <div class="widget-body filter clearfix" ng-if="option.showFilter">\n' +
    '            <div class="uia-input-group pull-left" ng-repeat="filterColumn in option.filters">\n' +
    '                <label ng-bind="filterColumn.title"></label>\n' +
    '                <div>\n' +
    '                    <input type="text" name="{{filterColumn.name}}" ng-model="queryParams[filterColumn.name]" placeholder="{{filterColumn.placeholder}}">\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="btn-group btn-group-xs pull-left operation">\n' +
    '                <button class="btn search" ng-enter="loadDataList()" ng-click="loadDataList()"><i class="icon icon-search"></i></button>\n' +
    '                <button class="btn reset" ng-click="reset()"><i class="icon icon-undo"></i></button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        <div class="widget-body">\n' +
    '            <table class="table table-bordered">\n' +
    '                <thead>\n' +
    '                <tr>\n' +
    '                    <th ng-repeat="item in option.columns" data-ng-click="sort(item.name)">\n' +
    '                        {{item.text}}\n' +
    '                        <span ng-if="option.sort">\n' +
    '                            <!--   TODO 下列class写法不支持ngHtml2js压缩规范，需要重构\n' +
    '                            <!--<i ng-class="iconsort==item.name ? (sortway ? \'icon-caret-up\':\'icon-caret-down\'):\'icon-sort\'" class="sort"></i>-->\n' +
    '                        </span>\n' +
    '                    </th>\n' +
    '                </tr>\n' +
    '                </thead>\n' +
    '                <!--显示翻页则是后台过滤-->\n' +
    '                <tbody ng-if="(dataList || dataList.length) && !option.hidePagination">\n' +
    '                <tr ng-click="current(item)" data-ng-dblclick="currentSave(item)" ng-repeat="item in dataList" ng-class="{\'current-tr\':item.isChoiced}">\n' +
    '                    <td ng-repeat="column in option.columns">\n' +
    '                        <span ng-if="column.formatter" ng-bind="formatter(item[column.name], column)"></span>\n' +
    '                        <span ng-if="!column.formatter && !column.type" ng-bind="item[column.name]"></span>\n' +
    '                            <span ng-if="!column.formatter && column.type" class="{{column.type}}">\n' +
    '                                <i class="icon" ng-class="{\'icon-check\' : item[column.name],\'icon-check-empty\': !item[column.name] }"></i>\n' +
    '                            </span>\n' +
    '                    </td>\n' +
    '                </tr>\n' +
    '                </tbody>\n' +
    '                <!--隐藏分页是前台过滤-->\n' +
    '                <tbody ng-if="(dataList || dataList.length) && option.hidePagination">\n' +
    '                <tr ng-click="current(item)" data-ng-dblclick="currentSave(item)" ng-repeat="item in dataList | filter:queryParams" ng-class="{\'current-tr\':item.isChoiced}">\n' +
    '                    <td ng-repeat="column in option.columns">\n' +
    '                        <span ng-if="column.formatter" ng-bind="formatter(item[column.name], column)"></span>\n' +
    '                        <span ng-if="!column.formatter && !column.type" ng-bind="item[column.name]"></span>\n' +
    '                        <span ng-if="!column.formatter && column.type" class="{{column.type}}">\n' +
    '                            <i class="icon" ng-class="{\'icon-check\' : item[column.name],\'icon-check-empty\': !item[column.name] }"></i>\n' +
    '                        </span>\n' +
    '                    </td>\n' +
    '                </tr>\n' +
    '                </tbody>\n' +
    '            </table>\n' +
    '            <div ng-show="!dataList || !dataList.length">\n' +
    '                暂时并未查到任何信息\n' +
    '            </div>\n' +
    '            <div class="widget-toolbar" style="padding: 0px" ng-show="(dataList || dataList.length) && !option.hidePagination">\n' +
    '                <ug-pagination page-info="pageInfoSetting" load-event="loadDataList()" load-parameter="queryParam"></ug-pagination>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '    <div class="modal-footer">\n' +
    '        <button class="btn btn-warning" type="button" data-ng-click="clear()">清除</button>\n' +
    '        <button class="btn btn-success" type="submit" data-ng-click="choice()">确定</button>\n' +
    '        <button class="btn btn-default" ng-click="cancel()">关闭</button>\n' +
    '    </div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/dialog-out.html',
    '<div class="modal-header confirm-header">\n' +
    '    <h3 class="modal-title" ng-bind="message.title"></h3>\n' +
    '    <span class="closeModal" ng-click="close()"><i class="icon icon-remove"></i></span>\n' +
    '</div>\n' +
    '<div class="modal-body confirm-body">\n' +
    '    <div class="widget-body" ng-bind="message.content">\n' +
    '    </div>\n' +
    '</div>\n' +
    '<div class="modal-footer confirm-footer">\n' +
    '    <div class="footer">\n' +
    '        <button class="btn btn-primary {{message.btnYesClass}}" type="button" data-ng-click="yes()" ng-bind="message.btnYesText"></button>\n' +
    '    </div>\n' +
    '    <div class="footer">\n' +
    '        <button class="btn btn-warning {{message.btnNoClass}}" type="button" ng-click="no()" ng-bind="message.btnNoText"></button>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/dialog.html',
    '<div class="modal-header confirm-header">\n' +
    '    <h3 class="modal-title" ng-bind="message.title"></h3>\n' +
    '    <span class="closeModal" ng-click="close()"><i class="icon icon-remove"></i></span>\n' +
    '</div>\n' +
    '<div class="modal-body confirm-body">\n' +
    '    <div class="widget-body" ng-bind="message.content">\n' +
    '    </div>\n' +
    '</div>\n' +
    '<div class="modal-footer confirm-footer">\n' +
    '    <div ng-class="{\'footer\':message.btnYesShow==message.btnNoShow}" ng-show="message.btnYesShow">\n' +
    '        <button class="btn btn-primary {{message.btnYesClass}}" type="button" data-ng-click="yes()" ng-bind="message.btnYesText"></button>\n' +
    '    </div>\n' +
    '    <div ng-class="{\'footer\':message.btnYesShow==message.btnNoShow}" ng-show="message.btnNoShow">\n' +
    '        <button class="btn btn-warning {{message.btnNoClass}}" type="button" ng-click="no()" ng-bind="message.btnNoText"></button>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/dictionary.html',
    '<option value>请选择</option>\n' +
    '<option ng-repeat="item in dictInfoList" ng-selected="item.selected" value="{{item.dictCode}}">{{item.dictName}}</option>');
}]);
})();

(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/grid.html',
    '<div class="container-fluid">\n' +
    '    <div class="row-fluid">\n' +
    '        <div class="widget-box">\n' +
    '            <div class="widget-title">\n' +
    '                <span class="icon"> <i class="icon-th"></i></span>\n' +
    '                <h5 ng-bind="gridOption.title"></h5>\n' +
    '                <div class="uia-btn-group">\n' +
    '                    <button class="btn" ng-repeat="btn in gridOption.buttons" ng-if="gridOption.buttons" ng-click="btn.click()"><i class="icon {{btn.icon}}" ng-if="btn.icon">&nbsp;&nbsp;{{btn.label}}</i></button>\n' +
    '                    <!--<btn-filter event-click=""></btn-filter>-->\n' +
    '                    <btn-revise event-click="reviseEvent()" ng-if="reviseBtnShow()" permission permission-only="gridOption.reviseBtn.permission"></btn-revise>\n' +
    '                    <btn-delete event-click="removeEvent()" permission permission-only="gridOption.removeBtn.permission"></btn-delete>\n' +
    '                    <btn-add event-click="addEvent()" permission permission-only="gridOption.addBtn.permission"></btn-add>\n' +
    '                    <btn-view event-click="viewEvent()"></btn-view>\n' +
    '                    <btn-refresh event-click="refreshEvent()"></btn-refresh>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="widget-content">\n' +
    '                <div class="widget-content-body">\n' +
    '                    <form name="searchForm">\n' +
    '                        <div class="uia-search-toolbar">\n' +
    '                            <div class="uia-search-toolbar-item" ng-repeat="filterColumn in gridOption.filters">\n' +
    '                                <label for="{{filterColumn.name}}" ng-bind="filterColumn.title"></label>\n' +
    '                                <!--    日期      -->\n' +
    '                                <input type="text" id="{{filterColumn.name}}" name="filterColumn.name" ng-if="filterColumn.type==\'date\'" uia-date ng-model="queryParams[filterColumn.name]" placeholder="{{filterColumn.placeholder}}">\n' +
    '                                <!--    文本      -->\n' +
    '                                <input type="text" id="{{filterColumn.name}}" name="filterColumn.name" ng-if="!filterColumn.type || filterColumn.type==\'text\'" ng-model="queryParams[filterColumn.name]" placeholder="{{filterColumn.placeholder}}">\n' +
    '                                <!--    选择框    -->\n' +
    '                                <select id="{{filterColumn.name}}" name="filterColumn.name" ng-if="filterColumn.type == \'select\'" uia-select dict-code="filterColumn.dictCode" ng-model="queryParams[filterColumn.name]">\n' +
    '                                    <option value="">请选择</option>\n' +
    '                                </select>\n' +
    '                                <!--    弹出选择框      -->\n' +
    '                                <input type="text" id="{{filterColumn.name}}" name="filterColumn.name" ng-if="filterColumn.type==\'choice\'" uia-choice choice-option="filterColumn.choiceOption" choice-model-label="queryParams[filterColumn.choiceModelLabel]" ng-model="queryParams[filterColumn.name]" placeholder="{{filterColumn.placeholder}}">\n' +
    '                            </div>\n' +
    '                            <div class="uia-search-toolbar-item uia-search-toolbar-item-btnGroup">\n' +
    '                                <div class="btn-group">\n' +
    '                                    <btn-search event-click="search()"></btn-search>\n' +
    '                                    <btn-reset event-click="reset()"></btn-reset>\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </div>\n' +
    '                    </form>\n' +
    '                </div>\n' +
    '                <div class="widget-content-body">\n' +
    '                    <table class="uia-table">\n' +
    '                        <thead>\n' +
    '                            <tr>\n' +
    '                                <th data-ng-click="sort(columnValue.name)" ng-repeat="(columnKey, columnValue) in gridOption.columns">\n' +
    '                                    <span ng-bind="columnValue.title"></span>\n' +
    '                                    <i ng-if="gridOption.showOrderBy" ng-class="iconsort===columnValue.name ? (sortway ? \'icon-caret-down\':\'icon-caret-up\'):\'icon-sort\'" class="sort"></i>\n' +
    '                                </th>\n' +
    '                            </tr>\n' +
    '                        </thead>\n' +
    '                        <tbody ng-show="gridOption.data && gridOption.data.length > 0">\n' +
    '                            <tr ng-class="{\'current-tr\': currentChoiceItem.$$hashKey==item.$$hashKey}" data-ng-dblclick="dbcEvent(item)" ng-repeat="item in gridOption.data" data-ng-click="choiceEvent(item)">\n' +
    '                                <td ng-repeat="(columnKey, columnValue) in gridOption.columns" ng-class="{\'uia-checkbox\':columnValue.type == \'checkbox\'}">\n' +
    '                                    <!--    文本框    -->\n' +
    '                                    <div ng-bind="item[columnValue.name]" ng-if="!columnValue.type||columnValue.type == \'text\'"></div>\n' +
    '                                    <!--    日期    -->\n' +
    '                                    <div ng-bind="formatterValue(item[columnValue.name], columnValue)" ng-if="columnValue.type == \'date\' || columnValue.type == \'currency\' || columnValue.type == \'number\' || columnValue.type == \'myriabit\'"></div>\n' +
    '                                    <!--    checkbox    -->\n' +
    '                                    <div ng-if="columnValue.type == \'checkbox\'">\n' +
    '                                        <input type="checkbox" disabled="disabled" ng-model="item[columnValue.name]" ng-checked="columnValue.checked(item)">\n' +
    '                                    </div>\n' +
    '                                </td>\n' +
    '                            </tr>\n' +
    '                        </tbody>\n' +
    '                    </table>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <uia-pagination page-info="gridOption.pageInfo" load-parameter="gridOption.queryParam" load-event="search()"></uia-pagination>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('uia');
} catch (e) {
  module = angular.module('uia', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('uia/template/pagination.html',
    '<div class="widget-toolbar">\n' +
    '    <div class="page-control clearfix">\n' +
    '        <div class="page-operation">\n' +
    '            <div class="btn-group">\n' +
    '                <span class="page-number">\n' +
    '                    <span>\n' +
    '                        <select class="pages" style="width: 50px" ng-model="maxSize">\n' +
    '                            <option value="10">10</option>\n' +
    '                            <option value="30">30</option>\n' +
    '                            <option value="50">50</option>\n' +
    '                            <option value="100">100</option>\n' +
    '                        </select>页数\n' +
    '                    </span>\n' +
    '                </span>\n' +
    '                <button class="pages" ng-click="skipPage(curPage-1)" ng-disabled="curPage==1"><i class="icon icon-chevron-left"></i></button>\n' +
    '                <button class="pages" ng-repeat="item in pageList" ng-bind="item.num" data-ng-click="skipPage(item.num)" ng-disabled="page.isOmit || item.num==curPage"></button>\n' +
    '                <button class="pages" ng-click="skipPage(curPage+1)" ng-disabled="curPage==pages"><i class="icon icon-chevron-right"></i></button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '        <div class="page-informations">\n' +
    '            <span>总计\n' +
    '                <strong class="colorred">{{total}}</strong>条\n' +
    '            </span>\n' +
    '            <span>\n' +
    '                <span>\n' +
    '                    <strong class="colorred">{{curPage}} /</strong>\n' +
    '                </span>\n' +
    '                <span>\n' +
    '                    <strong class="colorred">{{pages}}</strong>\n' +
    '                </span>\n' +
    '            </span>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>');
}]);
})();

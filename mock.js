/**
 * Created by tanxinzheng on 17/1/14.
 */
//mockAPI.js

var fs = require('fs');
var path = require('path');

var mockbase = path.join(__dirname, 'api');

var mockApi = function(res, pathname, paramObj, next) {
    switch (pathname) {
        case '/account':
            var data = fs.readFileSync(path.join(mockbase, 'account.json'), 'utf-8');

             res.setHeader('Content-Type', 'application/json');
            //res.setHeader('Content-type', 'application/javascript');
            res.end(paramObj.callback + '(' + data + ')');
            return ;

        case '/account/permissions':
            var data = fs.readFileSync(path.join(mockbase, 'account/permissions.json'), 'utf-8');
            res.setHeader('Content-type', 'application/json');
            res.end(data);
            return ;
        default:
            ;
    }
    next();
};

module.exports = mockApi;
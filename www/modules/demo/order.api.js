/**
 * Created by Jeng on 2016/1/28.
 */
define(function () {
    return angular.module("Order.REST",[
        "ngResource"
    ]).factory("OrderAPI", ["Resource", function(Resource){
        var resource = Resource("/order/:id", { id:"@id" });
        resource.export = function(data, success, error){
            if(!data.url){
                data.url = "/order/export";
            }
            resource.$export(data, success, error);
        };
        return resource;
    }]);
});

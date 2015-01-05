'use strict';

myApp.factory('mainData', function ($http, $log) {
    return {
        getAllTowns: function (success) {
            return $http({
                method: 'GET',
                url: 'http://softuni-ads.azurewebsites.net/api/towns',
                cache: true
            })
                .success(function (data) {
                    success(data);
                })
                .error(function(data) {
                    $log.warn(data);
                });
        }
    }
});

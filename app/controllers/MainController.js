'use strict';

angular.module('adsApp.main', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'index1.html',
            controller: 'MainCtrl'
        });
    }])

    .controller('MainCtrl', ['$scope', function ($scope) {
        $scope.name = 'Name';
    }]);

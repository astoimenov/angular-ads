'use strict';

angular.module('adsApp.login', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl'
        });
    }])

    .controller('LoginCtrl', ['$scope', function ($scope) {
        $scope.title = 'Login';

        $scope.user = {
            username: '',
            password: ''
        };
    }]);

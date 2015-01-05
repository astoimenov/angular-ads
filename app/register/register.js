'use strict';

angular.module('myApp.register', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/register', {
            templateUrl: 'register/register.html',
            controller: 'RegisterCtrl'
        });
    }])

    .controller('RegisterCtrl', ['$scope', 'mainData', function ($scope, mainData) {
        $scope.title = 'Registration';

        mainData.getAllTowns(function (resp) {
            $scope.towns = resp;
        });

        $scope.user = {
            username: '',
            password: '',
            name: '',
            email: '',
            phone: '',
            town: ''
        }
    }]);

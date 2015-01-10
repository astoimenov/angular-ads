'use strict';

adsApp.controller('HomeCtrl', [
    '$scope',
    '$location',
    '$route',
    'userData',
    'authentication',
    function ($scope, $location, $route, userData, authentication) {

        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();

        $scope.logout = function (user) {
            userData.logout(user);

            if ($location.$$path == '/') {
                $route.reload();
            } else {
                $location.path('/');
            }
        }
    }]);

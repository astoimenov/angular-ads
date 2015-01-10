'use strict';

adsApp.controller('LoginCtrl', [
    '$scope',
    '$location',
    'userData',
    'notification',
    function ($scope, $location, userData, notification) {

        $scope.login = function (user) {
            userData.login(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Login successful');
                    $location.path('/user/home');
                }, function error(error) {
                    notification.showError('Invalid login', error);
                }
            );
        }
    }]);

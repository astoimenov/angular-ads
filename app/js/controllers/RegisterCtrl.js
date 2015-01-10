'use strict';

adsApp.controller('RegisterCtrl', [
    '$scope',
    '$location',
    'townsData',
    'userData',
    'notification',
    function ($scope, $location, townsData, userData, notification) {

        $scope.towns = townsData.getTowns();

        $scope.register = function (user) {
            userData.register(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('User account created. Please log in.');
                    $location.path('/login');
                },
                function error(error) {
                    notification.showError('Invalid registration', error);
                }
            );
        }
    }]);

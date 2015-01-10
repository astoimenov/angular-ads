'use strict';

adsApp.controller('EditProfileCtrl', [
    '$scope',
    '$location',
    'townsData',
    'userData',
    'notification',
    function ($scope, $location, townsData, userData, notification) {

        $scope.pass = {
            oldPassword: null,
            newPassword: null,
            confirmPassword: null
        };

        townsData.getTowns()
            .$promise
            .then(function (data) {
                $scope.towns = data;
            });

        userData.getUserProfile()
            .$promise
            .then(
            function (data) {
                $scope.user = data;
            }
        );

        $scope.edit = function (user) {
            userData.edit(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('User profile successfully updated.');
                    $location.path('/user/ads');
                },
                function error(err) {
                    notification.showError('User profile is not updated.', err);
                }
            );
        };

        $scope.changePassword = function (pass) {
            userData.changePassword(pass)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Password successfully updated.');
                    $location.path('/user/ads');
                },
                function error(err) {
                    notification.showError('Password is not updated.', err);
                }
            );
        }
    }]);

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

        $scope.towns = townsData.getTowns();
        $scope.user = userData.getUserProfile();

        $scope.edit = function (user) {
            userData.edit(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('User profile successfully updated.');
                    $location.path('/user/home');
                },
                function error(error) {
                    notification.showError('User profile is not updated.', error);
                }
            );
        };

        $scope.changePassword = function (pass) {
            userData.changePassword(pass)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Password successfully updated.');
                    $location.path('/user/home');
                },
                function error(error) {
                    notification.showError('Password is not updated.', error);
                }
            );
        }
    }]);

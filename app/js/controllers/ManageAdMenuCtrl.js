'use strict';

adsApp.controller('ManageAdMenuCtrl', [
    '$scope',
    '$route',
    'userAdsData',
    'notification',
    function ($scope, $route, userAdsData, notification) {

        $scope.deactivate = function (adId) {
            userAdsData.deactivate(adId)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Ad is deactivated');
                    $route.reload();
                }, function error(error) {
                    notification.showError('Can\'t deactivate the ad', error);
                }
            );
        };

        $scope.publishAgain = function (adId) {
            userAdsData.publishAgain(adId)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Ad is published again for approval.');
                    $route.reload();
                }, function error(error) {
                    notification.showError('Can\'t publish the ad', error);
                }
            );
        }

    }]);

'use strict';

adsApp.controller('DeleteAdCtrl', [
    '$scope',
    '$location',
    '$routeParams',
    'userAdsData',
    'notification',
    function ($scope, $location, $routeParams,
              userAdsData, notification) {

        var adId = $routeParams.id;

        userAdsData.getAdById(adId)
            .$promise
            .then(
            function success(data) {
                $scope.ad = data;
            },
            function error(error) {
                notification.showError('Advertisement can not be deleted', error);
            }
        );

        $scope.delete = function (id) {
            userAdsData.delete(id)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Advertisement deleted');
                    $location.path('/user/ads');
                },
                function error(error) {
                    notification.showError('Advertisement can not be deleted', error);
                }
            );
        }

    }]);

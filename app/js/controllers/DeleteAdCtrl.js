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
            function error(err) {
                notification.showError('Advertisement can not be deleted', err);
            }
        );

        $scope.delete = function (id) {
            userAdsData.delete(id)
                .$promise
                .then(
                function success(data) {
                    notification.showInfo('Advertisement deleted');
                    $location.path('/user/ads');
                },
                function error(err) {
                    notification.showError('Advertisement can not be deleted', err);
                }
            );
        }

    }]);

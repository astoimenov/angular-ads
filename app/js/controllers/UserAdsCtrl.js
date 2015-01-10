'use strict';

adsApp.controller('UserAdsCtrl', [
    '$scope',
    '$route',
    'adsData',
    'userAdsData',
    'userData',
    'pageSize',
    'notification',
    function ($scope, $route, adsData, userAdsData, userData, pageSize, notification) {

        $scope.inMyAds = true;
        $scope.ready = false;
        $scope.adsParams = {
            'startPage': 1,
            'pageSize': pageSize
        };

        $scope.reloadAds = function () {
            userAdsData.getUserAds($scope.adsParams)
                .$promise
                .then(
                function success(data) {
                    $scope.ads = data;
                    $scope.ready = true;
                },
                function error(error) {
                    notification.showError('Cannot load ads', error);
                }
            );
        };

        $scope.reloadAds();

        $scope.$on('categorySelectionChanged', function (event, selectedCategoryId) {
            $scope.adsParams.categoryId = selectedCategoryId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });

        $scope.$on('townSelectionChanged', function (event, selectedTownId) {
            $scope.adsParams.townId = selectedTownId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });

        $scope.$on('statusSelectionChanged', function (event, selectedStatusId) {
            $scope.adsParams.status = selectedStatusId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });
    }]);

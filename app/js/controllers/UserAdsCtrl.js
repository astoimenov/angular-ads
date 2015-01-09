adsApp.controller('UserAdsCtrl', [
    '$scope',
    '$route',
    'adsData',
    'userData',
    'pageSize',
    'notification',
    function ($scope, $route, adsData, userData, pageSize, notification) {

        $scope.inMyAds = true;
        $scope.ready = false;
        $scope.adsParams = {
            'startPage': 1,
            'pageSize': pageSize
        };

        $scope.deactivate = function (adId) {
            adsData.deactivate(adId)
                .$promise
                .then(function () {
                    notification.showInfo('Ad is deactivated');
                    $route.reload();
                }, function (error) {
                    notification.showError('Can\'t deactivate the ad', error);
                });
        };

        $scope.reloadAds = function () {
            userData.getUserAds(
                $scope.adsParams,
                function success(data) {
                    $scope.ads = data;
                    $scope.ready = true;

                    userData.getUserProfile(
                        function success(data) {
                            $scope.ownerData = data;
                        }
                    );
                },
                function error(err) {
                    notification.showError('Cannot load ads', err);
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
    }]);

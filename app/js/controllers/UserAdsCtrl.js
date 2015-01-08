adsApp.controller('UserAdsCtrl', [
    '$scope',
    'userData',
    'pageSize',
    'notification',
    function ($scope, userData, pageSize, notification) {

        $scope.ready = false;
        $scope.adsParams = {
            'startPage': 1,
            'pageSize': pageSize
        };

        $scope.reloadAds = function () {
            userData.getUserAds(
                $scope.adsParams,
                function success(data) {
                    $scope.adsData = data;
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

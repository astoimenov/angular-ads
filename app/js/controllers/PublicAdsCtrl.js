adsApp.controller('PublicAdsCtrl', [
    '$scope',
    'adsData',
    'pageSize',
    'notification',
    function ($scope, adsData, pageSize, notification) {
        $scope.ready = false;
        $scope.adsParams = {
            'startPage': 1,
            'pageSize': pageSize
        };

        $scope.reloadAds = function () {
            adsData.getPublicAds(
                $scope.adsParams,
                function success(data) {
                    $scope.adsData = data;
                    $scope.ready = true;
                },
                function error(err) {
                    notification.showError('Cannot load ads', err);
                }
            );
        };

        $scope.reloadAds();
}]);

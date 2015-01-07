adsApp.directive('publicAds', function () {
    return {
        controller: 'PublicAdsCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/public-ads.html',
        replace: true
    }
});

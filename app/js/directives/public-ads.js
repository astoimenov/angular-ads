adsApp.directive('publicAds', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/public-ads.html',
        replace: true
    }
});

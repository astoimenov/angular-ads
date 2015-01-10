'use strict';

adsApp.directive('userAds', function () {
    return {
        controller: 'UserAdsCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/user-ads.html',
        replace: true
    }
});

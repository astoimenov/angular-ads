adsApp.directive('publishNewAd', function () {
    return {
        controller: 'PublishNewAdCtrl',
        restrict: 'E',
        templateUrl: '../../templates/publish-new-ad.html',
        replace: true
    }
});

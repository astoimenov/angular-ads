adsApp.directive('towns', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/towns.html',
        replace: true
    }
});

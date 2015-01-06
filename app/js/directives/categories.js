adsApp.directive('categories', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/categories.html',
        replace: true
    }
});

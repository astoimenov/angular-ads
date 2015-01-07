adsApp.directive('categories', function () {
    return {
        controller: 'RightSidebarCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/categories.html',
        replace: true
    }
});

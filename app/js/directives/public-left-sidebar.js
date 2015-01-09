adsApp.directive('publicLeftSidebar', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/left-sidebar.html',
        replace: true
    }
});

adsApp.directive('loggedInSidebar', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/logged-in-sidebar.html',
        replace: true
    }
});

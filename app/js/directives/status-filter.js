adsApp.directive('statusFilter', function () {
    return {
        controller: 'StatusFilterCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/status-filter.html',
        replace: true
    }
});

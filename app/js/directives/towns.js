'use strict';

adsApp.directive('towns', function () {
    return {
        controller: 'RightSidebarCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/towns.html',
        replace: true
    }
});

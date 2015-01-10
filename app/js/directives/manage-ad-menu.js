'use strict';

adsApp.directive('manageAdMenu', function () {
    return {
        controller: 'ManageAdMenuCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/manage-ad-menu.html',
        replace: true
    }
});

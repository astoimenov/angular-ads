'use strict';

adsApp.controller('StatusFilterCtrl', [
    '$scope',
    '$rootScope',
    function ($scope, $rootScope) {

        $scope.statusClicked = function (selectedStatusId) {
            $scope.selectedStatusId = selectedStatusId;
            $rootScope.$broadcast('statusSelectionChanged', selectedStatusId);
        };

    }]);

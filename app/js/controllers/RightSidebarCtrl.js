adsApp.controller('RightSidebarCtrl', [
    '$scope',
    '$rootScope',
    'townsData',
    'categoriesData',
    function ($scope, $rootScope, townsData, categoriesData) {
        $scope.categories = categoriesData.getCategories();
        $scope.towns = townsData.getTowns();

        $scope.categoryClicked = function (clickedCategoryId) {
            $scope.selectedCategoryId = clickedCategoryId;
            $rootScope.$broadcast('categorySelectionChanged', clickedCategoryId);
        };

        $scope.townClicked = function (clickedTownId) {
            $scope.selectedTownId = clickedTownId;
            $rootScope.$broadcast('townSelectionChanged', clickedTownId);
        };
    }]);

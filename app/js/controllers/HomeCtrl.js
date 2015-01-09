adsApp.controller('HomeCtrl', [
    '$scope',
    '$location',
    '$route',
    'userData',
    'authentication',
    function ($scope, $location, $route, userData, authentication) {

        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();

}]);

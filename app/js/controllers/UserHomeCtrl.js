adsApp.controller('UserHomeCtrl', [
    '$scope',
    '$location',
    '$route',
    'userData',
    'authentication',
    function ($scope, $location, $route, userData, authentication) {

        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();
        $scope.inHome = $location.$$path == '/user/home';
        $scope.inMyAds = $location.$$path == '/user/ads';
        $scope.inPublishNew = $location.$$path == '/user/ads/publish';

        $scope.logout = function (user) {
            userData.logout(user);

            if ($location.$$path == '/') {
                $route.reload();
            } else {
                $location.path('/');
            }
        }
    }]);

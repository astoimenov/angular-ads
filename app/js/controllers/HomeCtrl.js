adsApp.controller('HomeCtrl', [
    '$scope',
    '$location',
    'userData',
    'authentication',
    function ($scope, $location, userData, authentication) {

        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();
        $scope.inPublic = $location.$$path == '/';
        $scope.inMyAds = $location.$$path == '/user/ads';
        $scope.inPublishNew = $location.$$path == '/user/ads/new';

        console.log(authentication.getUserData());

        $scope.logout = function (user) {
            userData.logout(user);
            $location.path('/');
        }
}]);

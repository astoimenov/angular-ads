adsApp.controller('LoginCtrl', [
    '$scope',
    '$location',
    'userData',
    'notification',
    function ($scope, $location, userData, notification) {

        $scope.login = function (user) {
            userData.login(user)
                .$promise
                .then(function () {
                    notification.showInfo('Login successful');
                    $location.path('/user/home');
                }, function(error) {
                    notification.showError('Invalid login', error);
                });
        }
}]);

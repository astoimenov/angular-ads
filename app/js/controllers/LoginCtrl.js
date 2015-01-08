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
                    $location.path('/');
                }, function(error) {
                    notification.showError('Invalid login', error);
                });

            //authentication.login(user, function () {
            //    notification.showInfo('Login successful');
            //    $location.path('/');
            //}, function(error) {
            //    notification.showError('Invalid login', error);
            //})

        }
}]);

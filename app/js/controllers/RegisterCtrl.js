adsApp.controller('RegisterCtrl', [
    '$scope',
    '$location',
    'townsData',
    'userData',
    'notification',
    function ($scope, $location, townsData, userData, notification) {

        townsData.getTowns()
            .$promise
            .then(function (data) {
                $scope.towns = data;
            });

        $scope.register = function (user) {
            userData.register(user)
                .$promise
                .then(function () {
                    notification.showInfo('User account created. Please log in.');
                    $location.path('/login');
                }, function (error) {
                    notification.showError('Invalid registration', error);
                });
        }
    }]);

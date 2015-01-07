adsApp.controller('RegisterCtrl', ['$scope', 'townsData', 'userData', function ($scope, townsData, userData) {
    $scope.title = 'Register';

    townsData.getTowns()
        .$promise
        .then(function (data) {
            $scope.towns = data;
        });

    $scope.register = function (user) {
        userData.register(user);
    }
}]);

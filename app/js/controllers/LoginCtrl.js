adsApp.controller('LoginCtrl', ['$scope', 'userData', function ($scope, userData) {
    $scope.title = 'Login';

    $scope.login = function (user) {
        userData.login(user);
    }
}]);

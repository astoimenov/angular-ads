adsApp.controller('HomeCtrl', ['$scope', 'userData', function ($scope, userData) {
    $scope.title = 'Home';

    $scope.logout = function (user) {
        userData.logout(user);
    }
}]);

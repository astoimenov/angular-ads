adsApp.factory('authentication', ['localStorageService', function (localStorageService) {
    var key = 'user';

    function saveUserData(data) {
        localStorageService.set(key, data);
    }

    function getUserData() {
        localStorageService.get(key);
    }

    return {
        saveUser: saveUserData,
        getUser: getUserData
    }
}]);

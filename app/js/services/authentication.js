'use strict';

adsApp.factory('authentication', [
    'localStorageService',
    function (localStorageService) {

        var key = 'user';

        function saveUserData(data) {
            localStorageService.set(key, data);
        }

        function getUserData() {
            return localStorageService.get(key);
        }

        function removeUser() {
            localStorage.removeItem('ls.user');
        }

        function getHeaders() {
            var headers = {};
            var userData = getUserData();

            if (userData) {
                headers.Authorization = 'Bearer ' + userData.access_token;
            }

            return headers;
        }

        function isAdmin() {
            return getUserData().isAdmin;
        }

        function isLoggedIn() {
            return !!getUserData();
        }

        return {
            saveUser: saveUserData,
            getUserData: getUserData,
            removeUser: removeUser,
            getHeaders: getHeaders,
            isAdmin: isAdmin,
            isLoggedIn: isLoggedIn
        }
    }]);

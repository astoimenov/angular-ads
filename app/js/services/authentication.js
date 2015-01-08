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

            if(userData){
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

//'use strict';
//
//adsApp.factory('authentication',
//    function ($http, baseServiceUrl) {
//        return {
//            login: function (userData, success, error) {
//                var request = {
//                    method: 'POST',
//                    url: baseServiceUrl + '/user/login',
//                    data: userData
//                };
//                $http(request).success(function (data) {
//                    sessionStorage['currentUser'] = JSON.stringify(data);
//                    success(data);
//                }).error(error);
//            },
//
//            register: function (userData, success, error) {
//                var request = {
//                    method: 'POST',
//                    url: baseServiceUrl + '/user/register',
//                    data: userData
//                };
//                $http(request).success(function (data) {
//                    sessionStorage['currentUser'] = JSON.stringify(data);
//                    success(data);
//                }).error(error);
//            },
//
//            logout: function () {
//                delete sessionStorage['currentUser'];
//            },
//
//            getCurrentUser: function () {
//                var userObject = sessionStorage['currentUser'];
//                if (userObject) {
//                    return JSON.parse(sessionStorage['currentUser']);
//                }
//            },
//
//            isAnonymous: function () {
//                return sessionStorage['currentUser'] == undefined;
//            },
//
//            isLoggedIn: function () {
//                return sessionStorage['currentUser'] != undefined;
//            },
//
//            isNormalUser: function () {
//                var currentUser = this.getCurrentUser();
//                return (currentUser != undefined) && (!currentUser.isAdmin);
//            },
//
//            isAdmin: function () {
//                var currentUser = this.getCurrentUser();
//                return (currentUser != undefined) && (currentUser.isAdmin);
//            },
//
//            getAuthHeaders: function () {
//                var headers = {};
//                var currentUser = this.getCurrentUser();
//                if (currentUser) {
//                    headers['Authorization'] = 'Bearer ' + currentUser.access_token;
//                }
//                return headers;
//            }
//        }
//    }
//);


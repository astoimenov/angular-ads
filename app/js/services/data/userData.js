adsApp.factory('userData', [
    '$http',
    '$resource',
    'baseServiceUrl',
    'authentication',
    function ($http, $resource, baseServiceUrl, authentication) {

        var userServiceUrl = baseServiceUrl + 'user/';

        function getUserProfile() {
            var resource = $resource(userServiceUrl + 'profile', {}, {
                get: {
                    method: 'GET',
                    headers: authentication.getHeaders()
                }
            });

            return resource.get();
        }

        function registerUser(user) {
            return $resource(userServiceUrl + 'register')
                .save(user);
        }

        function loginUser(user) {
            var resource = $resource(userServiceUrl + 'login')
                .save(user);

            resource.$promise
                .then(function (data) {
                    authentication.saveUser(data);
                });

            return resource;
        }

        function editUserProfile(user) {
            var resource = $resource(userServiceUrl + 'profile', {}, {
                update: {
                    method: 'PUT',
                    headers: authentication.getHeaders()
                }
            });

            return resource.update(user);
        }

        function changeUserPassword(pass) {
            var resource = $resource(userServiceUrl + 'changePassword', {}, {
                update: {
                    method: 'PUT',
                    headers: authentication.getHeaders()
                }
            });

            return resource.update(pass);
        }

        function logout() {
            authentication.removeUser();
        }

        return {
            getUserProfile: getUserProfile,
            register: registerUser,
            login: loginUser,
            edit: editUserProfile,
            changePassword: changeUserPassword,
            logout: logout
        }
    }]);

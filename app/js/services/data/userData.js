adsApp.factory('userData', [
    '$http',
    '$resource',
    'baseServiceUrl',
    'authentication',
    function ($http, $resource, baseServiceUrl, authentication) {

        function getUserProfile(success, error) {
            var request = {
                method: 'GET',
                url: baseServiceUrl + '/user/profile',
                headers: authentication.getHeaders()
            };

            $http(request).success(success).error(error);
        }

        function registerUser(user) {
            return $resource(baseServiceUrl + 'user/register')
                .save(user);
        }

        function loginUser(user) {
            var resource = $resource(baseServiceUrl + 'user/login')
                .save(user);

            resource.$promise
                .then(function (data) {
                    authentication.saveUser(data);
                });

            return resource;
        }

        function logout() {
            authentication.removeUser();
        }

        return {
            getUserProfile: getUserProfile,
            register: registerUser,
            login: loginUser,
            logout: logout
        }
    }]);

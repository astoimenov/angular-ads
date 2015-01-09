adsApp.factory('userData', [
    '$http',
    '$resource',
    'baseServiceUrl',
    'authentication',
    function ($http, $resource, baseServiceUrl, authentication) {

        function createNewAd(adData, success, error) {
            var request = {
                method: 'POST',
                url: baseServiceUrl + '/user/ads',
                headers: authentication.getHeaders(),
                data: adData
            };

            $http(request).success(success).error(error);
        }

        function getUserAds(params, success, error) {
            var resource = $resource(baseServiceUrl + 'user/ads:adId', {adId: '@id'}, {
                update: { method: 'PUT' },
                getAll: {
                    method: 'GET',
                    headers: authentication.getHeaders()
                }
            });

            return resource.getAll(params, success, error);
        }

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
            createNewAd: createNewAd,
            getUserAds: getUserAds,
            getUserProfile: getUserProfile,
            register: registerUser,
            login: loginUser,
            logout: logout
        }
    }]);

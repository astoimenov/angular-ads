adsApp.factory('userAdsData', [
    '$resource',
    'authentication',
    'baseServiceUrl',
    function ($resource, authentication, baseServiceUrl) {

        var resource = $resource(baseServiceUrl + 'user/ads/:adId', {adId: '@id'}, {
            update: {
                method: 'PUT',
                headers: authentication.getHeaders()
            },
            getAll: {
                method: 'GET',
                headers: authentication.getHeaders()
            },
            get: {
                method: 'GET',
                headers: authentication.getHeaders()
            },
            remove: {
                method: 'DELETE',
                headers: authentication.getHeaders()
            },
            save: {
                method: 'POST',
                headers: authentication.getHeaders()
            }
        });

        function createNewAd(ad) {
            return resource.save(ad);
        }

        function getUserAds(params) {
            return resource.getAll(params);
        }

        function getAdById(adId) {
            return resource.get({adId: adId});
        }

        function editAd(adId, ad) {
            return resource.update({adId: adId}, ad);
        }

        function deactivateAd(adId) {
            var resource = $resource(baseServiceUrl + 'user/ads/deactivate/:adId', {adId: '@id'}, {
                update: {
                    method: 'PUT',
                    headers: authentication.getHeaders()
                }
            });

            return resource.update({id: adId});
        }

        function publishAgainAd(adId) {
            var resource = $resource(baseServiceUrl + 'user/ads/publishagain/:adId', {adId: '@id'}, {
                update: {
                    method: 'PUT',
                    headers: authentication.getHeaders()
                }
            });

            return resource.update({id: adId});
        }

        function removeAd(adId) {
            return resource.remove({adId: adId});
        }

        return {
            add: createNewAd,
            getUserAds: getUserAds,
            getAdById: getAdById,
            edit: editAd,
            deactivate: deactivateAd,
            publishAgain: publishAgainAd,
            delete: removeAd
        }
    }]);

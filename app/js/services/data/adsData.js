'use strict';

adsApp.factory('adsData', [
    '$resource',
    'authentication',
    'baseServiceUrl',
    function ($resource, authentication, baseServiceUrl) {
        var resource = $resource(baseServiceUrl + 'ads/:adId', {adId: '@id'}, {
            update: {
                method: 'PUT'
            },
            getAll: {
                method: 'GET'
            }
        });

        function createAd(ad) {
            return resource.save(ad);
        }

        function getPublicAds(params) {
            return resource.getAll(params);
        }

        function editAd(adId, ad) {
            return resource.update({id: adId}, ad);
        }

        return {
            add: createAd,
            getPublicAds: getPublicAds,
            edit: editAd
        }
    }]);

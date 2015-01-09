adsApp.factory('adsData', [
    '$resource',
    'authentication',
    'baseServiceUrl',
    function ($resource, authentication, baseServiceUrl) {
    var resource = $resource(baseServiceUrl + 'ads/:adId', { adId: '@id' }, {
        update: { method: 'PUT' },
        getAll: { method: 'GET' }
    });

    function createAd(ad) {
        return resource.save(ad);
    }

    function getPublicAds(params, success, error) {
        return resource.getAll(params, success, error);
    }

    function getAdById(adId) {
        return resource.get({ id: adId });
    }

    function editAd(adId, ad) {
        return resource.update({ id: adId }, ad);
    }

    function deactivateAd(adId) {
        var res = $resource(baseServiceUrl + 'user/ads/deactivate/:adId', {adId: '@id'}, {
            update: {
                method: 'PUT',
                headers: authentication.getHeaders()
            }
        });

        return res.update({ id: adId });
    }

    function removeAd(adId) {
        return resource.remove({ id: adId });
    }

    return {
        add: createAd,
        getPublicAds: getPublicAds,
        getAdById: getAdById,
        edit: editAd,
        deactivate: deactivateAd,
        delete: removeAd
    }
}]);

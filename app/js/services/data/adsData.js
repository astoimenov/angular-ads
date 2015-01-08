adsApp.factory('adsData', [
    '$resource',
    'baseServiceUrl',
    function ($resource, baseServiceUrl) {
    var resource = $resource(baseServiceUrl + 'ads:adId', { adId: '@id' }, {
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

    function editAd(adid, ad) {
        return resource.update({ id: adid }, ad);
    }

    function removeAd(adId) {
        return resource.remove({ id: adId });
    }

    return {
        add: createAd,
        getPublicAds: getPublicAds,
        getAdById: getAdById,
        edit: editAd,
        delete: removeAd
    }
}]);

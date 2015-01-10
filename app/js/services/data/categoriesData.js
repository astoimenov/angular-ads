'use strict';

adsApp.factory('categoriesData', [
    '$resource',
    'baseServiceUrl',
    function ($resource, baseServiceUrl) {

        var resource = $resource(baseServiceUrl + 'categories');

        function getCategories() {
            return resource.query();
        }

        return {
            getCategories: getCategories
        }
    }]);

'use strict';

adsApp.controller('EditAdCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'townsData',
    'categoriesData',
    'userAdsData',
    'notification',
    function ($scope, $routeParams, $location, townsData, categoriesData,
              userAdsData, notification) {

        var adId = $routeParams.id;
        var changeImage = false;

        userAdsData.getAdById(adId)
            .$promise
            .then(
            function success(data) {
                $scope.adData = data;
            },
            function error(err) {
                notification.showError('Advertisement can not be edited', err);
            }
        );

        $scope.categories = categoriesData.getCategories();
        $scope.towns = townsData.getTowns();

        $scope.deleteImage = function (adData) {
            delete $scope.adData.imageDataUrl;
            changeImage = true;
        };

        $scope.fileSelected = function (fileInputField) {
            delete $scope.adData.imageDataUrl;
            var file = fileInputField.files[0];
            if (file.type.match(/image\/.*/)) {
                var reader = new FileReader();
                reader.onload = function () {
                    $scope.adData.imageDataUrl = reader.result;
                    changeImage = true;
                    $(".image-box").html("<img src='" + reader.result + "'>");
                };

                reader.readAsDataURL(file);
            } else {
                $(".image-box").html("<p>File type not supported!</p>");
            }
        };


        $scope.edit = function (adData) {
            adData.changeImage = changeImage;

            userAdsData.edit(adId, adData)
                .$promise
                .then(
                function success() {
                    notification.showInfo(
                        'Advertisement edited. Don\'t forget to submit it for publishing.');
                    $location.path('/user/ads');
                },
                function error(err) {
                    notification.showError('Editing failed', err);
                });
        };

    }]);

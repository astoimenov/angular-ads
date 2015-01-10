'use strict';

adsApp.controller('PublishNewAdCtrl', [
    '$scope',
    '$location',
    'townsData',
    'categoriesData',
    'userAdsData',
    'notification',
    function ($scope, $location, townsData, categoriesData,
              userAdsData, notification) {

        $scope.adData = {
            townId: null,
            categoryId: null
        };

        $scope.categories = categoriesData.getCategories();
        $scope.towns = townsData.getTowns();

        $scope.fileSelected = function (fileInputField) {
            delete $scope.adData.imageDataUrl;
            var file = fileInputField.files[0];

            if (file.type.match(/image\/.*/)) {
                var reader = new FileReader();
                reader.onload = function () {
                    $scope.adData.imageDataUrl = reader.result;
                    $(".image-box").html("<img src='" + reader.result + "'>");
                };

                reader.readAsDataURL(file);
            } else {
                $(".image-box").html("<p>File type not supported!</p>");
            }
        };


        $scope.publishAd = function (adData) {
            if (adData.imageDataUrl == null) {
                adData.imageDataUrl = '';
            }

            userAdsData.add(adData)
                .$promise
                .then(
                function success() {
                    notification.showInfo(
                        'Advertisement submitted dor approval. Once approved, it will be published.');
                    $location.path('/user/ads');
                },
                function error(error) {
                    notification.showError('Publishing failed', error);
                }
            );
        }
    }]);

'use strict';

var adsApp = angular.module('adsApp', [
    'ngRoute',
    'ngResource',
    'LocalStorageModule',
    'validation.match',
    'ui.bootstrap.pagination'
])

    .config([
        '$routeProvider',
        'localStorageServiceProvider',
        function ($routeProvider, localStorageServiceProvider) {
            $routeProvider.when('/', {
                title: 'Home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            });

            $routeProvider.when('/login', {
                title: 'Login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            });

            $routeProvider.when('/register', {
                title: 'Register',
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            });

            $routeProvider.when('/user/home', {
                title: 'Home',
                templateUrl: 'templates/user-home.html',
                controller: 'UserHomeCtrl'
            });

            $routeProvider.when('/user/ads', {
                title: 'My ads',
                templateUrl: 'templates/user-home.html',
                controller: 'UserAdsCtrl'
            });

            $routeProvider.when('/user/ads/publish', {
                title: 'Publish new ad',
                templateUrl: 'templates/publish-new-ad.html',
                controller: 'PublishNewAdCtrl'
            });

            $routeProvider.when('/user/ads/edit/:id', {
                title: 'Edit ad',
                templateUrl: 'templates/edit-ad.html',
                controller: 'EditAdCtrl'
            });

            $routeProvider.when('/user/ads/delete/:id', {
                title: 'Delete ad',
                templateUrl: 'templates/delete-ad.html',
                controller: 'DeleteAdCtrl'
            });

            $routeProvider.when('/user/profile', {
                title: 'Edit user profile',
                templateUrl: 'templates/edit-profile.html',
                controller: 'EditProfileCtrl'
            });

            $routeProvider.otherwise({redirectTo: '/'});

            // Web storage settings
            localStorageServiceProvider.setStorageType('localStorage');
        }]);

adsApp.constant('baseServiceUrl', 'http://softuni-ads.azurewebsites.net/api/');
adsApp.constant('pageSize', 5);

adsApp.run(["$rootScope", "$location", "authentication", function ($rootScope, $location, authentication) {

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });

    $rootScope.$on('$locationChangeStart', function () {
        if ($location.path().indexOf('/user/') != -1 && !authentication.isLoggedIn()) {
            // Authorization check: anonymous site visitors cannot access user routes
            $location.path('/');
        }
    });
}]);

'use strict';

adsApp.controller('DeleteAdCtrl', [
    '$scope',
    '$location',
    '$routeParams',
    'userAdsData',
    'notification',
    function ($scope, $location, $routeParams,
              userAdsData, notification) {

        $scope.homeLink = 'user/home';
        var adId = $routeParams.id;

        userAdsData.getAdById(adId)
            .$promise
            .then(
            function success(data) {
                $scope.ad = data;
            },
            function error(error) {
                notification.showError('Advertisement can not be deleted', error);
            }
        );

        $scope.delete = function (id) {
            userAdsData.delete(id)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Advertisement deleted');
                    $location.path('/user/ads');
                },
                function error(error) {
                    notification.showError('Advertisement can not be deleted', error);
                }
            );
        }

    }]);

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

        $scope.homeLink = 'user/home';
        var adId = $routeParams.id;
        var changeImage = false;

        userAdsData.getAdById(adId)
            .$promise
            .then(
            function success(data) {
                $scope.adData = data;
            },
            function error(error) {
                notification.showError('Advertisement can not be edited', error);
            }
        );

        $scope.categories = categoriesData.getCategories();
        $scope.towns = townsData.getTowns();

        $scope.deleteImage = function () {
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
                function error(error) {
                    notification.showError('Editing failed', error);
                }
            );
        };

    }]);

'use strict';

adsApp.controller('EditProfileCtrl', [
    '$scope',
    '$location',
    'townsData',
    'userData',
    'notification',
    function ($scope, $location, townsData, userData, notification) {

        $scope.homeLink = 'user/home';
        $scope.pass = {
            oldPassword: null,
            newPassword: null,
            confirmPassword: null
        };

        $scope.towns = townsData.getTowns();
        $scope.user = userData.getUserProfile();

        $scope.edit = function (user) {
            userData.edit(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('User profile successfully updated.');
                    $location.path('/user/home');
                },
                function error(error) {
                    notification.showError('User profile is not updated.', error);
                }
            );
        };

        $scope.changePassword = function (pass) {
            userData.changePassword(pass)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Password successfully updated.');
                    $location.path('/user/home');
                },
                function error(error) {
                    notification.showError('Password is not updated.', error);
                }
            );
        }
    }]);

'use strict';

adsApp.controller('HomeCtrl', [
    '$scope',
    '$location',
    '$route',
    'userData',
    'authentication',
    function ($scope, $location, $route, userData, authentication) {

        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();

        $scope.logout = function (user) {
            userData.logout(user);

            if ($location.$$path == '/') {
                $route.reload();
            } else {
                $location.path('/');
            }
        }
    }]);

'use strict';

adsApp.controller('LoginCtrl', [
    '$scope',
    '$location',
    'userData',
    'notification',
    function ($scope, $location, userData, notification) {

        $scope.login = function (user) {
            userData.login(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Login successful');
                    $location.path('/user/home');
                }, function error(error) {
                    notification.showError('Invalid login', error);
                }
            );
        }
    }]);

'use strict';

adsApp.controller('ManageAdMenuCtrl', [
    '$scope',
    '$route',
    'userAdsData',
    'notification',
    function ($scope, $route, userAdsData, notification) {

        $scope.deactivate = function (adId) {
            userAdsData.deactivate(adId)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Ad is deactivated');
                    $route.reload();
                }, function error(error) {
                    notification.showError('Can\'t deactivate the ad', error);
                }
            );
        };

        $scope.publishAgain = function (adId) {
            userAdsData.publishAgain(adId)
                .$promise
                .then(
                function success() {
                    notification.showInfo('Ad is published again for approval.');
                    $route.reload();
                }, function error(error) {
                    notification.showError('Can\'t publish the ad', error);
                }
            );
        }

    }]);

'use strict';

adsApp.controller('PublicAdsCtrl', [
    '$scope',
    'adsData',
    'pageSize',
    'notification',
    function ($scope, adsData, pageSize, notification) {

        $scope.ready = false;
        $scope.adsParams = {
            startPage: 1,
            pageSize: pageSize
        };

        $scope.reloadAds = function () {
            adsData.getPublicAds($scope.adsParams)
                .$promise
                .then(
                function success(data) {
                    $scope.ads = data;
                    $scope.ready = true;
                },
                function error(error) {
                    notification.showError('Cannot load ads', error);
                }
            );
        };

        $scope.reloadAds();

        $scope.$on('categorySelectionChanged', function (event, selectedCategoryId) {
            $scope.adsParams.categoryId = selectedCategoryId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });

        $scope.$on('townSelectionChanged', function (event, selectedTownId) {
            $scope.adsParams.townId = selectedTownId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });
    }]);

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

        $scope.homeLink = 'user/home';
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
                        'Advertisement submitted for approval. Once approved, it will be published.');
                    $location.path('/user/ads');
                },
                function error(error) {
                    notification.showError('Publishing failed', error);
                }
            );
        }
    }]);

'use strict';

adsApp.controller('RegisterCtrl', [
    '$scope',
    '$location',
    'townsData',
    'userData',
    'notification',
    function ($scope, $location, townsData, userData, notification) {

        $scope.towns = townsData.getTowns();

        $scope.register = function (user) {
            userData.register(user)
                .$promise
                .then(
                function success() {
                    notification.showInfo('User account created. Please log in.');
                    $location.path('/login');
                },
                function error(error) {
                    notification.showError('Invalid registration', error);
                }
            );
        }
    }]);

'use strict';

adsApp.controller('RightSidebarCtrl', [
    '$scope',
    '$rootScope',
    'townsData',
    'categoriesData',
    function ($scope, $rootScope, townsData, categoriesData) {

        $scope.categories = categoriesData.getCategories();
        $scope.towns = townsData.getTowns();

        $scope.categoryClicked = function (clickedCategoryId) {
            $scope.selectedCategoryId = clickedCategoryId;
            $rootScope.$broadcast('categorySelectionChanged', clickedCategoryId);
        };

        $scope.townClicked = function (clickedTownId) {
            $scope.selectedTownId = clickedTownId;
            $rootScope.$broadcast('townSelectionChanged', clickedTownId);
        };
    }]);

'use strict';

adsApp.controller('StatusFilterCtrl', [
    '$scope',
    '$rootScope',
    function ($scope, $rootScope) {

        $scope.statusClicked = function (selectedStatusId) {
            $scope.selectedStatusId = selectedStatusId;
            $rootScope.$broadcast('statusSelectionChanged', selectedStatusId);
        };

    }]);

'use strict';

adsApp.controller('UserAdsCtrl', [
    '$scope',
    '$route',
    'adsData',
    'userAdsData',
    'userData',
    'pageSize',
    'notification',
    function ($scope, $route, adsData, userAdsData, userData, pageSize, notification) {

        $scope.homeLink = 'user/home';
        $scope.inMyAds = true;
        $scope.ready = false;
        $scope.adsParams = {
            'startPage': 1,
            'pageSize': pageSize
        };

        $scope.reloadAds = function () {
            userAdsData.getUserAds($scope.adsParams)
                .$promise
                .then(
                function success(data) {
                    $scope.ads = data;
                    $scope.ready = true;
                },
                function error(error) {
                    notification.showError('Cannot load ads', error);
                }
            );
        };

        $scope.reloadAds();

        $scope.$on('categorySelectionChanged', function (event, selectedCategoryId) {
            $scope.adsParams.categoryId = selectedCategoryId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });

        $scope.$on('townSelectionChanged', function (event, selectedTownId) {
            $scope.adsParams.townId = selectedTownId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });

        $scope.$on('statusSelectionChanged', function (event, selectedStatusId) {
            $scope.adsParams.status = selectedStatusId;
            $scope.adsParams.startPage = 1;
            $scope.reloadAds();
        });
    }]);

'use strict';

adsApp.controller('UserHomeCtrl', [
    '$scope',
    '$location',
    '$route',
    'userData',
    'authentication',
    function ($scope, $location, $route, userData, authentication) {

        $scope.homeLink = 'user/home';
        $scope.authentication = authentication;
        $scope.isLoggedIn = authentication.isLoggedIn();
        $scope.inHome = $location.$$path == '/user/home';
        $scope.inMyAds = $location.$$path == '/user/ads';
        $scope.inPublishNew = $location.$$path == '/user/ads/publish';

        $scope.logout = function (user) {
            userData.logout(user);

            if ($location.$$path == '/') {
                $route.reload();
            } else {
                $location.path('/');
            }
        }
    }]);

'use strict';

adsApp.factory('authentication', [
    'localStorageService',
    function (localStorageService) {

        var key = 'user';

        function saveUserData(data) {
            localStorageService.set(key, data);
        }

        function getUserData() {
            return localStorageService.get(key);
        }

        function removeUser() {
            localStorage.removeItem('ls.user');
        }

        function getHeaders() {
            var headers = {};
            var userData = getUserData();

            if (userData) {
                headers.Authorization = 'Bearer ' + userData.access_token;
            }

            return headers;
        }

        function isAdmin() {
            return getUserData().isAdmin;
        }

        function isLoggedIn() {
            return !!getUserData();
        }

        return {
            saveUser: saveUserData,
            getUserData: getUserData,
            removeUser: removeUser,
            getHeaders: getHeaders,
            isAdmin: isAdmin,
            isLoggedIn: isLoggedIn
        }
    }]);

'use strict';

adsApp.factory(
    'notification',
    function () {
        return {
            showInfo: function (msg) {
                noty({
                        text: msg,
                        type: 'info',
                        layout: 'topCenter',
                        timeout: 3000
                    }
                );
            },
            showError: function (msg, serverError) {
                // Collect errors to display from the server response
                var errors = [];
                if (serverError && serverError.data.error_description) {
                    errors.push(serverError.data.error_description);
                }

                if (serverError && serverError.data.modelState) {
                    var modelStateErrors = serverError.data.modelState;
                    for (var propertyName in modelStateErrors) {
                        var errorMessages = modelStateErrors[propertyName];
                        var trimmedName =
                            propertyName.substr(propertyName.indexOf('.') + 1);
                        for (var i = 0; i < errorMessages.length; i++) {
                            var currentError = errorMessages[i];
                            errors.push(trimmedName + ' - ' + currentError);
                        }
                    }
                }

                if (errors.length > 0) {
                    msg = msg + ":<br>" + errors.join("<br>");
                }

                noty({
                        text: msg,
                        type: 'error',
                        layout: 'topCenter',
                        timeout: 5000
                    }
                );
            }
        }
    }
);

'use strict';

adsApp.directive('categories', function () {
    return {
        controller: 'RightSidebarCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/categories.html',
        replace: true
    }
});

'use strict';

adsApp.directive('changeTitleOnBlur',[
    function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope) {
                document.title = 'Ads - ' + scope.title;

            $(window).focus(function () {
                document.title = 'Ads - ' + scope.title;
            });

            $(window).blur(function () {
                document.title = 'I miss you..';
            });
        }
    }
}]);

adsApp.directive('diHref', ['$location', '$route',
    function ($location, $route) {
        return function (scope, element, attrs) {
            scope.$watch('diHref', function () {
                if (attrs.diHref) {
                    element.attr('href', attrs.diHref);
                    element.bind('click', function () {
                        scope.$apply(function () {
                            if ('#' + $location.path() == attrs.diHref) {
                                $route.reload();
                            }
                        });
                    });
                }
            });
        }
    }]);

'use strict';

adsApp.directive('loggedInSidebar', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/logged-in-sidebar.html',
        replace: true
    }
});

'use strict';

adsApp.directive('manageAdMenu', function () {
    return {
        controller: 'ManageAdMenuCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/manage-ad-menu.html',
        replace: true
    }
});

'use strict';

adsApp.directive('navigation', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/navigation.html',
        replace: true
    }
});

'use strict';

adsApp.directive('publicAds', function () {
    return {
        controller: 'PublicAdsCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/public-ads.html',
        replace: true
    }
});

'use strict';

adsApp.directive('publicLeftSidebar', function () {
    return {
        controller: 'HomeCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/left-sidebar.html',
        replace: true
    }
});

'use strict';

adsApp.directive('statusFilter', function () {
    return {
        controller: 'StatusFilterCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/status-filter.html',
        replace: true
    }
});

'use strict';

adsApp.directive('towns', function () {
    return {
        controller: 'RightSidebarCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/towns.html',
        replace: true
    }
});

'use strict';

adsApp.directive('userAds', function () {
    return {
        controller: 'UserAdsCtrl',
        restrict: 'E',
        templateUrl: 'templates/directives/user-ads.html',
        replace: true
    }
});

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

'use strict';

adsApp.factory('townsData', [
    '$resource',
    'baseServiceUrl',
    function ($resource, baseServiceUrl) {

        var resource = $resource(baseServiceUrl + 'towns');

        function getTowns() {
            return resource.query();
        }

        return {
            getTowns: getTowns
        }
    }]);

'use strict';

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

'use strict';

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
                .then(
                function success(data) {
                    authentication.saveUser(data);
                }
            );

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL0RlbGV0ZUFkQ3RybC5qcyIsImNvbnRyb2xsZXJzL0VkaXRBZEN0cmwuanMiLCJjb250cm9sbGVycy9FZGl0UHJvZmlsZUN0cmwuanMiLCJjb250cm9sbGVycy9Ib21lQ3RybC5qcyIsImNvbnRyb2xsZXJzL0xvZ2luQ3RybC5qcyIsImNvbnRyb2xsZXJzL01hbmFnZUFkTWVudUN0cmwuanMiLCJjb250cm9sbGVycy9QdWJsaWNBZHNDdHJsLmpzIiwiY29udHJvbGxlcnMvUHVibGlzaE5ld0FkQ3RybC5qcyIsImNvbnRyb2xsZXJzL1JlZ2lzdGVyQ3RybC5qcyIsImNvbnRyb2xsZXJzL1JpZ2h0U2lkZWJhckN0cmwuanMiLCJjb250cm9sbGVycy9TdGF0dXNGaWx0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvVXNlckFkc0N0cmwuanMiLCJjb250cm9sbGVycy9Vc2VySG9tZUN0cmwuanMiLCJzZXJ2aWNlcy9hdXRoZW50aWNhdGlvbi5qcyIsInNlcnZpY2VzL25vdGlmaWNhdGlvbi5qcyIsImRpcmVjdGl2ZXMvY2F0ZWdvcmllcy5qcyIsImRpcmVjdGl2ZXMvY2hhbmdlLXRpdGxlLW9uLWJsdXIuanMiLCJkaXJlY3RpdmVzL2RpLWhyZWYuanMiLCJkaXJlY3RpdmVzL2xvZ2dlZC1pbi1zaWRlYmFyLmpzIiwiZGlyZWN0aXZlcy9tYW5hZ2UtYWQtbWVudS5qcyIsImRpcmVjdGl2ZXMvbmF2aWdhdGlvbi5qcyIsImRpcmVjdGl2ZXMvcHVibGljLWFkcy5qcyIsImRpcmVjdGl2ZXMvcHVibGljLWxlZnQtc2lkZWJhci5qcyIsImRpcmVjdGl2ZXMvc3RhdHVzLWZpbHRlci5qcyIsImRpcmVjdGl2ZXMvdG93bnMuanMiLCJkaXJlY3RpdmVzL3VzZXItYWRzLmpzIiwic2VydmljZXMvZGF0YS9hZHNEYXRhLmpzIiwic2VydmljZXMvZGF0YS9jYXRlZ29yaWVzRGF0YS5qcyIsInNlcnZpY2VzL2RhdGEvdG93bnNEYXRhLmpzIiwic2VydmljZXMvZGF0YS91c2VyQWRzRGF0YS5qcyIsInNlcnZpY2VzL2RhdGEvdXNlckRhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsSUFBQSxTQUFBLFFBQUEsT0FBQSxVQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7O0tBR0EsT0FBQTtRQUNBO1FBQ0E7UUFDQSxVQUFBLGdCQUFBLDZCQUFBO1lBQ0EsZUFBQSxLQUFBLEtBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7OztZQUdBLGVBQUEsS0FBQSxVQUFBO2dCQUNBLE9BQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzs7WUFHQSxlQUFBLEtBQUEsYUFBQTtnQkFDQSxPQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1lBR0EsZUFBQSxLQUFBLGNBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7OztZQUdBLGVBQUEsS0FBQSxhQUFBO2dCQUNBLE9BQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzs7WUFHQSxlQUFBLEtBQUEscUJBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7OztZQUdBLGVBQUEsS0FBQSxzQkFBQTtnQkFDQSxPQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTs7O1lBR0EsZUFBQSxLQUFBLHdCQUFBO2dCQUNBLE9BQUE7Z0JBQ0EsYUFBQTtnQkFDQSxZQUFBOzs7WUFHQSxlQUFBLEtBQUEsaUJBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxhQUFBO2dCQUNBLFlBQUE7OztZQUdBLGVBQUEsVUFBQSxDQUFBLFlBQUE7OztZQUdBLDRCQUFBLGVBQUE7OztBQUdBLE9BQUEsU0FBQSxrQkFBQTtBQUNBLE9BQUEsU0FBQSxZQUFBOztBQUVBLE9BQUEsa0RBQUEsVUFBQSxZQUFBLFdBQUEsZ0JBQUE7O0lBRUEsV0FBQSxJQUFBLHVCQUFBLFVBQUEsT0FBQSxTQUFBLFVBQUE7UUFDQSxXQUFBLFFBQUEsUUFBQSxRQUFBOzs7SUFHQSxXQUFBLElBQUEsd0JBQUEsWUFBQTtRQUNBLElBQUEsVUFBQSxPQUFBLFFBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLGNBQUE7O1lBRUEsVUFBQSxLQUFBOzs7OztBQ3RGQTs7QUFFQSxPQUFBLFdBQUEsZ0JBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsVUFBQSxRQUFBLFdBQUE7Y0FDQSxhQUFBLGNBQUE7O1FBRUEsT0FBQSxXQUFBO1FBQ0EsSUFBQSxPQUFBLGFBQUE7O1FBRUEsWUFBQSxVQUFBO2FBQ0E7YUFDQTtZQUNBLFNBQUEsUUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQTs7WUFFQSxTQUFBLE1BQUEsT0FBQTtnQkFDQSxhQUFBLFVBQUEsb0NBQUE7Ozs7UUFJQSxPQUFBLFNBQUEsVUFBQSxJQUFBO1lBQ0EsWUFBQSxPQUFBO2lCQUNBO2lCQUNBO2dCQUNBLFNBQUEsVUFBQTtvQkFDQSxhQUFBLFNBQUE7b0JBQ0EsVUFBQSxLQUFBOztnQkFFQSxTQUFBLE1BQUEsT0FBQTtvQkFDQSxhQUFBLFVBQUEsb0NBQUE7Ozs7Ozs7QUNsQ0E7O0FBRUEsT0FBQSxXQUFBLGNBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLFVBQUEsUUFBQSxjQUFBLFdBQUEsV0FBQTtjQUNBLGFBQUEsY0FBQTs7UUFFQSxPQUFBLFdBQUE7UUFDQSxJQUFBLE9BQUEsYUFBQTtRQUNBLElBQUEsY0FBQTs7UUFFQSxZQUFBLFVBQUE7YUFDQTthQUNBO1lBQ0EsU0FBQSxRQUFBLE1BQUE7Z0JBQ0EsT0FBQSxTQUFBOztZQUVBLFNBQUEsTUFBQSxPQUFBO2dCQUNBLGFBQUEsVUFBQSxtQ0FBQTs7OztRQUlBLE9BQUEsYUFBQSxlQUFBO1FBQ0EsT0FBQSxRQUFBLFVBQUE7O1FBRUEsT0FBQSxjQUFBLFlBQUE7WUFDQSxPQUFBLE9BQUEsT0FBQTtZQUNBLGNBQUE7OztRQUdBLE9BQUEsZUFBQSxVQUFBLGdCQUFBO1lBQ0EsT0FBQSxPQUFBLE9BQUE7WUFDQSxJQUFBLE9BQUEsZUFBQSxNQUFBOztZQUVBLElB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Y0FBQSxZQUFBO0lBQ0EsT0FBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7Ozs7QUNQQTs7QUFFQSxPQUFBLFVBQUEsb0JBQUE7SUFDQSxZQUFBO0lBQ0EsT0FBQTtRQUNBLFVBQUE7UUFDQSxPQUFBO1FBQ0EsTUFBQSxVQUFBLE9BQUE7Z0JBQ0EsU0FBQSxRQUFBLFdBQUEsTUFBQTs7WUFFQSxFQUFBLFFBQUEsTUFBQSxZQUFBO2dCQUNBLFNBQUEsUUFBQSxXQUFBLE1BQUE7OztZQUdBLEVBQUEsUUFBQSxLQUFBLFlBQUE7Z0JBQ0EsU0FBQSxRQUFBOzs7Ozs7QUNmQSxPQUFBLFVBQUEsVUFBQSxDQUFBLGFBQUE7SUFDQSxVQUFBLFdBQUEsUUFBQTtRQUNBLE9BQUEsVUFBQSxPQUFBLFNBQUEsT0FBQTtZQUNBLE1BQUEsT0FBQSxVQUFBLFlBQUE7Z0JBQ0EsSUFBQSxNQUFBLFFBQUE7b0JBQ0EsUUFBQSxLQUFBLFFBQUEsTUFBQTtvQkFDQSxRQUFBLEtBQUEsU0FBQSxZQUFBO3dCQUNBLE1BQUEsT0FBQSxZQUFBOzRCQUNBLElBQUEsTUFBQSxVQUFBLFVBQUEsTUFBQSxRQUFBO2dDQUNBLE9BQUE7Ozs7Ozs7OztBQ1RBOztBQUVBLE9BQUEsVUFBQSxtQkFBQSxZQUFBO0lBQ0EsT0FBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7Ozs7QUNQQTs7QUFFQSxPQUFBLFVBQUEsZ0JBQUEsWUFBQTtJQUNBLE9BQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLGFBQUE7UUFDQSxTQUFBOzs7O0FDUEE7O0FBRUEsT0FBQSxVQUFBLGNBQUEsWUFBQTtJQUNBLE9BQUE7UUFDQSxVQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7Ozs7QUNOQTs7QUFFQSxPQUFBLFVBQUEsYUFBQSxZQUFBO0lBQ0EsT0FBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7Ozs7QUNQQTs7QUFFQSxPQUFBLFVBQUEscUJBQUEsWUFBQTtJQUNBLE9BQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLGFBQUE7UUFDQSxTQUFBOzs7O0FDUEE7O0FBRUEsT0FBQSxVQUFBLGdCQUFBLFlBQUE7SUFDQSxPQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTs7OztBQ1BBOztBQUVBLE9BQUEsVUFBQSxTQUFBLFlBQUE7SUFDQSxPQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTs7OztBQ1BBOztBQUVBLE9BQUEsVUFBQSxXQUFBLFlBQUE7SUFDQSxPQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTs7OztBQ1BBOztBQUVBLE9BQUEsUUFBQSxXQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsVUFBQSxXQUFBLGdCQUFBLGdCQUFBO1FBQ0EsSUFBQSxXQUFBLFVBQUEsaUJBQUEsYUFBQSxDQUFBLE1BQUEsUUFBQTtZQUNBLFFBQUE7Z0JBQ0EsUUFBQTs7WUFFQSxRQUFBO2dCQUNBLFFBQUE7Ozs7UUFJQSxTQUFBLFNBQUEsSUFBQTtZQUNBLE9BQUEsU0FBQSxLQUFBOzs7UUFHQSxTQUFBLGFBQUEsUUFBQTtZQUNBLE9BQUEsU0FBQSxPQUFBOzs7UUFHQSxTQUFBLE9BQUEsTUFBQSxJQUFBO1lBQ0EsT0FBQSxTQUFBLE9BQUEsQ0FBQSxJQUFBLE9BQUE7OztRQUdBLE9BQUE7WUFDQSxLQUFBO1lBQ0EsY0FBQTtZQUNBLE1BQUE7Ozs7QUMvQkE7O0FBRUEsT0FBQSxRQUFBLGtCQUFBO0lBQ0E7SUFDQTtJQUNBLFVBQUEsV0FBQSxnQkFBQTs7UUFFQSxJQUFBLFdBQUEsVUFBQSxpQkFBQTs7UUFFQSxTQUFBLGdCQUFBO1lBQ0EsT0FBQSxTQUFBOzs7UUFHQSxPQUFBO1lBQ0EsZUFBQTs7OztBQ2RBOztBQUVBLE9BQUEsUUFBQSxhQUFBO0lBQ0E7SUFDQTtJQUNBLFVBQUEsV0FBQSxnQkFBQTs7UUFFQSxJQUFBLFdBQUEsVUFBQSxpQkFBQTs7UUFFQSxTQUFBLFdBQUE7WUFDQSxPQUFBLFNBQUE7OztRQUdBLE9BQUE7WUFDQSxVQUFBOzs7O0FDZEE7O0FBRUEsT0FBQSxRQUFBLGVBQUE7SUFDQTtJQUNBO0lBQ0E7SUFDQSxVQUFBLFdBQUEsZ0JBQUEsZ0JBQUE7O1FBRUEsSUFBQSxXQUFBLFVBQUEsaUJBQUEsa0JBQUEsQ0FBQSxNQUFBLFFBQUE7WUFDQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsU0FBQSxlQUFBOztZQUVBLFFBQUE7Z0JBQ0EsUUFBQTtnQkFDQSxTQUFBLGVBQUE7O1lBRUEsS0FBQTtnQkFDQSxRQUFBO2dCQUNBLFNBQUEsZUFBQTs7WUFFQSxRQUFBO2dCQUNBLFFBQUE7Z0JBQ0EsU0FBQSxlQUFBOztZQUVBLE1BQUE7Z0JBQ0EsUUFBQTtnQkFDQSxTQUFBLGVBQUE7Ozs7UUFJQSxTQUFBLFlBQUEsSUFBQTtZQUNBLE9BQUEsU0FBQSxLQUFBOzs7UUFHQSxTQUFBLFdBQUEsUUFBQTtZQUNBLE9BQUEsU0FBQSxPQUFBOzs7UUFHQSxTQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsU0FBQSxJQUFBLENBQUEsTUFBQTs7O1FBR0EsU0FBQSxPQUFBLE1BQUEsSUFBQTtZQUNBLE9BQUEsU0FBQSxPQUFBLENBQUEsTUFBQSxPQUFBOzs7UUFHQSxTQUFBLGFBQUEsTUFBQTtZQUNBLElBQUEsV0FBQSxVQUFBLGlCQUFBLDZCQUFBLENBQUEsTUFBQSxRQUFBO2dCQUNBLFFBQUE7b0JBQ0EsUUFBQTtvQkFDQSxTQUFBLGVBQUE7Ozs7WUFJQSxPQUFBLFNBQUEsT0FBQSxDQUFBLElBQUE7OztRQUdBLFNBQUEsZUFBQSxNQUFBO1lBQ0EsSUFBQSxXQUFBLFVBQUEsaUJBQUEsK0JBQUEsQ0FBQSxNQUFBLFFBQUE7Z0JBQ0EsUUFBQTtvQkFDQSxRQUFBO29CQUNBLFNBQUEsZUFBQTs7OztZQUlBLE9BQUEsU0FBQSxPQUFBLENBQUEsSUFBQTs7O1FBR0EsU0FBQSxTQUFBLE1BQUE7WUFDQSxPQUFBLFNBQUEsT0FBQSxDQUFBLE1BQUE7OztRQUdBLE9BQUE7WUFDQSxLQUFBO1lBQ0EsWUFBQTtZQUNBLFdBQUE7WUFDQSxNQUFBO1lBQ0EsWUFBQTtZQUNBLGNBQUE7WUFDQSxRQUFBOzs7O0FDaEZBOztBQUVBLE9BQUEsUUFBQSxZQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxVQUFBLE9BQUEsV0FBQSxnQkFBQSxnQkFBQTs7UUFFQSxJQUFBLGlCQUFBLGlCQUFBOztRQUVBLFNBQUEsaUJBQUE7WUFDQSxJQUFBLFdBQUEsVUFBQSxpQkFBQSxXQUFBLElBQUE7Z0JBQ0EsS0FBQTtvQkFDQSxRQUFBO29CQUNBLFNBQUEsZUFBQTs7OztZQUlBLE9BQUEsU0FBQTs7O1FBR0EsU0FBQSxhQUFBLE1BQUE7WUFDQSxPQUFBLFVBQUEsaUJBQUE7aUJBQ0EsS0FBQTs7O1FBR0EsU0FBQSxVQUFBLE1BQUE7WUFDQSxJQUFBLFdBQUEsVUFBQSxpQkFBQTtpQkFDQSxLQUFBOztZQUVBLFNBQUE7aUJBQ0E7Z0JBQ0EsU0FBQSxRQUFBLE1BQUE7b0JBQ0EsZUFBQSxTQUFBOzs7O1lBSUEsT0FBQTs7O1FBR0EsU0FBQSxnQkFBQSxNQUFBO1lBQ0EsSUFBQSxXQUFBLFVBQUEsaUJBQUEsV0FBQSxJQUFBO2dCQUNBLFFBQUE7b0JBQ0EsUUFBQTtvQkFDQSxTQUFBLGVBQUE7Ozs7WUFJQSxPQUFBLFNBQUEsT0FBQTs7O1FBR0EsU0FBQSxtQkFBQSxNQUFBO1lBQ0EsSUFBQSxXQUFBLFVBQUEsaUJBQUEsa0JBQUEsSUFBQTtnQkFDQSxRQUFBO29CQUNBLFFBQUE7b0JBQ0EsU0FBQSxlQUFBOzs7O1lBSUEsT0FBQSxTQUFBLE9BQUE7OztRQUdBLFNBQUEsU0FBQTtZQUNBLGVBQUE7OztRQUdBLE9BQUE7WUFDQSxnQkFBQTtZQUNBLFVBQUE7WUFDQSxPQUFBO1lBQ0EsTUFBQTtZQUNBLGdCQUFBO1lBQ0EsUUFBQTs7O0FBR0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGFkc0FwcCA9IGFuZ3VsYXIubW9kdWxlKCdhZHNBcHAnLCBbXHJcbiAgICAnbmdSb3V0ZScsXHJcbiAgICAnbmdSZXNvdXJjZScsXHJcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcclxuICAgICd2YWxpZGF0aW9uLm1hdGNoJyxcclxuICAgICd1aS5ib290c3RyYXAucGFnaW5hdGlvbidcclxuXSlcclxuXHJcbiAgICAuY29uZmlnKFtcclxuICAgICAgICAnJHJvdXRlUHJvdmlkZXInLFxyXG4gICAgICAgICdsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlciwgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy8nLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0hvbWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaG9tZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ3RybCdcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvbG9naW4nLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0xvZ2luJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvcmVnaXN0ZXInLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlZ2lzdGVyJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvdXNlci9ob21lJywge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdIb21lJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXItaG9tZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VySG9tZUN0cmwnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3VzZXIvYWRzJywge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdNeSBhZHMnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdXNlci1ob21lLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJBZHNDdHJsJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy91c2VyL2Fkcy9wdWJsaXNoJywge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdQdWJsaXNoIG5ldyBhZCcsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wdWJsaXNoLW5ldy1hZC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQdWJsaXNoTmV3QWRDdHJsJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy91c2VyL2Fkcy9lZGl0LzppZCcsIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnRWRpdCBhZCcsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9lZGl0LWFkLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0VkaXRBZEN0cmwnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3VzZXIvYWRzL2RlbGV0ZS86aWQnLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBhZCcsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kZWxldGUtYWQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVsZXRlQWRDdHJsJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy91c2VyL3Byb2ZpbGUnLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0VkaXQgdXNlciBwcm9maWxlJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2VkaXQtcHJvZmlsZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdFZGl0UHJvZmlsZUN0cmwnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnLyd9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFdlYiBzdG9yYWdlIHNldHRpbmdzXHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlci5zZXRTdG9yYWdlVHlwZSgnbG9jYWxTdG9yYWdlJyk7XHJcbiAgICAgICAgfV0pO1xyXG5cclxuYWRzQXBwLmNvbnN0YW50KCdiYXNlU2VydmljZVVybCcsICdodHRwOi8vc29mdHVuaS1hZHMuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpLycpO1xyXG5hZHNBcHAuY29uc3RhbnQoJ3BhZ2VTaXplJywgNSk7XHJcblxyXG5hZHNBcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sIGF1dGhlbnRpY2F0aW9uKSB7XHJcblxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS50aXRsZSA9IGN1cnJlbnQuJCRyb3V0ZS50aXRsZTtcclxuICAgIH0pO1xyXG5cclxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoJGxvY2F0aW9uLnBhdGgoKS5pbmRleE9mKCcvdXNlci8nKSAhPSAtMSAmJiAhYXV0aGVudGljYXRpb24uaXNMb2dnZWRJbigpKSB7XHJcbiAgICAgICAgICAgIC8vIEF1dGhvcml6YXRpb24gY2hlY2s6IGFub255bW91cyBzaXRlIHZpc2l0b3JzIGNhbm5vdCBhY2Nlc3MgdXNlciByb3V0ZXNcclxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdEZWxldGVBZEN0cmwnLCBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckbG9jYXRpb24nLFxyXG4gICAgJyRyb3V0ZVBhcmFtcycsXHJcbiAgICAndXNlckFkc0RhdGEnLFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sICRyb3V0ZVBhcmFtcyxcclxuICAgICAgICAgICAgICB1c2VyQWRzRGF0YSwgbm90aWZpY2F0aW9uKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5ob21lTGluayA9ICd1c2VyL2hvbWUnO1xyXG4gICAgICAgIHZhciBhZElkID0gJHJvdXRlUGFyYW1zLmlkO1xyXG5cclxuICAgICAgICB1c2VyQWRzRGF0YS5nZXRBZEJ5SWQoYWRJZClcclxuICAgICAgICAgICAgLiRwcm9taXNlXHJcbiAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5hZCA9IGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdBZHZlcnRpc2VtZW50IGNhbiBub3QgYmUgZGVsZXRlZCcsIGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgdXNlckFkc0RhdGEuZGVsZXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgLiRwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3dJbmZvKCdBZHZlcnRpc2VtZW50IGRlbGV0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3VzZXIvYWRzJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdBZHZlcnRpc2VtZW50IGNhbiBub3QgYmUgZGVsZXRlZCcsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuY29udHJvbGxlcignRWRpdEFkQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRyb3V0ZVBhcmFtcycsXHJcbiAgICAnJGxvY2F0aW9uJyxcclxuICAgICd0b3duc0RhdGEnLFxyXG4gICAgJ2NhdGVnb3JpZXNEYXRhJyxcclxuICAgICd1c2VyQWRzRGF0YScsXHJcbiAgICAnbm90aWZpY2F0aW9uJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uLCB0b3duc0RhdGEsIGNhdGVnb3JpZXNEYXRhLFxyXG4gICAgICAgICAgICAgIHVzZXJBZHNEYXRhLCBub3RpZmljYXRpb24pIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLmhvbWVMaW5rID0gJ3VzZXIvaG9tZSc7XHJcbiAgICAgICAgdmFyIGFkSWQgPSAkcm91dGVQYXJhbXMuaWQ7XHJcbiAgICAgICAgdmFyIGNoYW5nZUltYWdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHVzZXJBZHNEYXRhLmdldEFkQnlJZChhZElkKVxyXG4gICAgICAgICAgICAuJHByb21pc2VcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmFkRGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdBZHZlcnRpc2VtZW50IGNhbiBub3QgYmUgZWRpdGVkJywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzRGF0YS5nZXRDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgJHNjb3BlLnRvd25zID0gdG93bnNEYXRhLmdldFRvd25zKCk7XHJcblxyXG4gICAgICAgICRzY29wZS5kZWxldGVJbWFnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZGVsZXRlICRzY29wZS5hZERhdGEuaW1hZ2VEYXRhVXJsO1xyXG4gICAgICAgICAgICBjaGFuZ2VJbWFnZSA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmZpbGVTZWxlY3RlZCA9IGZ1bmN0aW9uIChmaWxlSW5wdXRGaWVsZCkge1xyXG4gICAgICAgICAgICBkZWxldGUgJHNjb3BlLmFkRGF0YS5pbWFnZURhdGFVcmw7XHJcbiAgICAgICAgICAgIHZhciBmaWxlID0gZmlsZUlucHV0RmllbGQuZmlsZXNbMF07XHJcblxyXG4gICAgICAgICAgICBpZiAoZmlsZS50eXBlLm1hdGNoKC9pbWFnZVxcLy4qLykpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYWREYXRhLmltYWdlRGF0YVVybCA9IHJlYWRlci5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlSW1hZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuaW1hZ2UtYm94XCIpLmh0bWwoXCI8aW1nIHNyYz0nXCIgKyByZWFkZXIucmVzdWx0ICsgXCInPlwiKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmltYWdlLWJveFwiKS5odG1sKFwiPHA+RmlsZSB0eXBlIG5vdCBzdXBwb3J0ZWQhPC9wPlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAkc2NvcGUuZWRpdCA9IGZ1bmN0aW9uIChhZERhdGEpIHtcclxuICAgICAgICAgICAgYWREYXRhLmNoYW5nZUltYWdlID0gY2hhbmdlSW1hZ2U7XHJcblxyXG4gICAgICAgICAgICB1c2VyQWRzRGF0YS5lZGl0KGFkSWQsIGFkRGF0YSlcclxuICAgICAgICAgICAgICAgIC4kcHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93SW5mbyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FkdmVydGlzZW1lbnQgZWRpdGVkLiBEb25cXCd0IGZvcmdldCB0byBzdWJtaXQgaXQgZm9yIHB1Ymxpc2hpbmcuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c2VyL2FkcycpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3dFcnJvcignRWRpdGluZyBmYWlsZWQnLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdFZGl0UHJvZmlsZUN0cmwnLCBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckbG9jYXRpb24nLFxyXG4gICAgJ3Rvd25zRGF0YScsXHJcbiAgICAndXNlckRhdGEnLFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIHRvd25zRGF0YSwgdXNlckRhdGEsIG5vdGlmaWNhdGlvbikge1xyXG5cclxuICAgICAgICAkc2NvcGUuaG9tZUxpbmsgPSAndXNlci9ob21lJztcclxuICAgICAgICAkc2NvcGUucGFzcyA9IHtcclxuICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IG51bGwsXHJcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBudWxsLFxyXG4gICAgICAgICAgICBjb25maXJtUGFzc3dvcmQ6IG51bGxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudG93bnMgPSB0b3duc0RhdGEuZ2V0VG93bnMoKTtcclxuICAgICAgICAkc2NvcGUudXNlciA9IHVzZXJEYXRhLmdldFVzZXJQcm9maWxlKCk7XHJcblxyXG4gICAgICAgICRzY29wZS5lZGl0ID0gZnVuY3Rpb24gKHVzZXIpIHtcclxuICAgICAgICAgICAgdXNlckRhdGEuZWRpdCh1c2VyKVxyXG4gICAgICAgICAgICAgICAgLiRwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3dJbmZvKCdVc2VyIHByb2ZpbGUgc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c2VyL2hvbWUnKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93RXJyb3IoJ1VzZXIgcHJvZmlsZSBpcyBub3QgdXBkYXRlZC4nLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNoYW5nZVBhc3N3b3JkID0gZnVuY3Rpb24gKHBhc3MpIHtcclxuICAgICAgICAgICAgdXNlckRhdGEuY2hhbmdlUGFzc3dvcmQocGFzcylcclxuICAgICAgICAgICAgICAgIC4kcHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93SW5mbygnUGFzc3dvcmQgc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c2VyL2hvbWUnKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93RXJyb3IoJ1Bhc3N3b3JkIGlzIG5vdCB1cGRhdGVkLicsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdIb21lQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRsb2NhdGlvbicsXHJcbiAgICAnJHJvdXRlJyxcclxuICAgICd1c2VyRGF0YScsXHJcbiAgICAnYXV0aGVudGljYXRpb24nLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJGxvY2F0aW9uLCAkcm91dGUsIHVzZXJEYXRhLCBhdXRoZW50aWNhdGlvbikge1xyXG5cclxuICAgICAgICAkc2NvcGUuYXV0aGVudGljYXRpb24gPSBhdXRoZW50aWNhdGlvbjtcclxuICAgICAgICAkc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGhlbnRpY2F0aW9uLmlzTG9nZ2VkSW4oKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgIHVzZXJEYXRhLmxvZ291dCh1c2VyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24uJCRwYXRoID09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgJHJvdXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRsb2NhdGlvbicsXHJcbiAgICAndXNlckRhdGEnLFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIHVzZXJEYXRhLCBub3RpZmljYXRpb24pIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24gKHVzZXIpIHtcclxuICAgICAgICAgICAgdXNlckRhdGEubG9naW4odXNlcilcclxuICAgICAgICAgICAgICAgIC4kcHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93SW5mbygnTG9naW4gc3VjY2Vzc2Z1bCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlci9ob21lJyk7XHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiBlcnJvcihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93RXJyb3IoJ0ludmFsaWQgbG9naW4nLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuY29udHJvbGxlcignTWFuYWdlQWRNZW51Q3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRyb3V0ZScsXHJcbiAgICAndXNlckFkc0RhdGEnLFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm91dGUsIHVzZXJBZHNEYXRhLCBub3RpZmljYXRpb24pIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLmRlYWN0aXZhdGUgPSBmdW5jdGlvbiAoYWRJZCkge1xyXG4gICAgICAgICAgICB1c2VyQWRzRGF0YS5kZWFjdGl2YXRlKGFkSWQpXHJcbiAgICAgICAgICAgICAgICAuJHByb21pc2VcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc3VjY2VzcygpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0luZm8oJ0FkIGlzIGRlYWN0aXZhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvdXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdDYW5cXCd0IGRlYWN0aXZhdGUgdGhlIGFkJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5wdWJsaXNoQWdhaW4gPSBmdW5jdGlvbiAoYWRJZCkge1xyXG4gICAgICAgICAgICB1c2VyQWRzRGF0YS5wdWJsaXNoQWdhaW4oYWRJZClcclxuICAgICAgICAgICAgICAgIC4kcHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93SW5mbygnQWQgaXMgcHVibGlzaGVkIGFnYWluIGZvciBhcHByb3ZhbC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAkcm91dGUucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiBlcnJvcihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93RXJyb3IoJ0NhblxcJ3QgcHVibGlzaCB0aGUgYWQnLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmNvbnRyb2xsZXIoJ1B1YmxpY0Fkc0N0cmwnLCBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICdhZHNEYXRhJyxcclxuICAgICdwYWdlU2l6ZScsXHJcbiAgICAnbm90aWZpY2F0aW9uJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsIGFkc0RhdGEsIHBhZ2VTaXplLCBub3RpZmljYXRpb24pIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmFkc1BhcmFtcyA9IHtcclxuICAgICAgICAgICAgc3RhcnRQYWdlOiAxLFxyXG4gICAgICAgICAgICBwYWdlU2l6ZTogcGFnZVNpemVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUucmVsb2FkQWRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhZHNEYXRhLmdldFB1YmxpY0Fkcygkc2NvcGUuYWRzUGFyYW1zKVxyXG4gICAgICAgICAgICAgICAgLiRwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hZHMgPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdDYW5ub3QgbG9hZCBhZHMnLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJlbG9hZEFkcygpO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdjYXRlZ29yeVNlbGVjdGlvbkNoYW5nZWQnLCBmdW5jdGlvbiAoZXZlbnQsIHNlbGVjdGVkQ2F0ZWdvcnlJZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYWRzUGFyYW1zLmNhdGVnb3J5SWQgPSBzZWxlY3RlZENhdGVnb3J5SWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5hZHNQYXJhbXMuc3RhcnRQYWdlID0gMTtcclxuICAgICAgICAgICAgJHNjb3BlLnJlbG9hZEFkcygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCd0b3duU2VsZWN0aW9uQ2hhbmdlZCcsIGZ1bmN0aW9uIChldmVudCwgc2VsZWN0ZWRUb3duSWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFkc1BhcmFtcy50b3duSWQgPSBzZWxlY3RlZFRvd25JZDtcclxuICAgICAgICAgICAgJHNjb3BlLmFkc1BhcmFtcy5zdGFydFBhZ2UgPSAxO1xyXG4gICAgICAgICAgICAkc2NvcGUucmVsb2FkQWRzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdQdWJsaXNoTmV3QWRDdHJsJywgW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJGxvY2F0aW9uJyxcclxuICAgICd0b3duc0RhdGEnLFxyXG4gICAgJ2NhdGVnb3JpZXNEYXRhJyxcclxuICAgICd1c2VyQWRzRGF0YScsXHJcbiAgICAnbm90aWZpY2F0aW9uJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRsb2NhdGlvbiwgdG93bnNEYXRhLCBjYXRlZ29yaWVzRGF0YSxcclxuICAgICAgICAgICAgICB1c2VyQWRzRGF0YSwgbm90aWZpY2F0aW9uKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5ob21lTGluayA9ICd1c2VyL2hvbWUnO1xyXG4gICAgICAgICRzY29wZS5hZERhdGEgPSB7XHJcbiAgICAgICAgICAgIHRvd25JZDogbnVsbCxcclxuICAgICAgICAgICAgY2F0ZWdvcnlJZDogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllc0RhdGEuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICAgICRzY29wZS50b3ducyA9IHRvd25zRGF0YS5nZXRUb3ducygpO1xyXG5cclxuICAgICAgICAkc2NvcGUuZmlsZVNlbGVjdGVkID0gZnVuY3Rpb24gKGZpbGVJbnB1dEZpZWxkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSAkc2NvcGUuYWREYXRhLmltYWdlRGF0YVVybDtcclxuICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlSW5wdXRGaWVsZC5maWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWxlLnR5cGUubWF0Y2goL2ltYWdlXFwvLiovKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5hZERhdGEuaW1hZ2VEYXRhVXJsID0gcmVhZGVyLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmltYWdlLWJveFwiKS5odG1sKFwiPGltZyBzcmM9J1wiICsgcmVhZGVyLnJlc3VsdCArIFwiJz5cIik7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChcIi5pbWFnZS1ib3hcIikuaHRtbChcIjxwPkZpbGUgdHlwZSBub3Qgc3VwcG9ydGVkITwvcD5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgJHNjb3BlLnB1Ymxpc2hBZCA9IGZ1bmN0aW9uIChhZERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGFkRGF0YS5pbWFnZURhdGFVcmwgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgYWREYXRhLmltYWdlRGF0YVVybCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1c2VyQWRzRGF0YS5hZGQoYWREYXRhKVxyXG4gICAgICAgICAgICAgICAgLiRwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3dJbmZvKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQWR2ZXJ0aXNlbWVudCBzdWJtaXR0ZWQgZm9yIGFwcHJvdmFsLiBPbmNlIGFwcHJvdmVkLCBpdCB3aWxsIGJlIHB1Ymxpc2hlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3VzZXIvYWRzJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uc2hvd0Vycm9yKCdQdWJsaXNoaW5nIGZhaWxlZCcsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBbXHJcbiAgICAnJHNjb3BlJyxcclxuICAgICckbG9jYXRpb24nLFxyXG4gICAgJ3Rvd25zRGF0YScsXHJcbiAgICAndXNlckRhdGEnLFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIHRvd25zRGF0YSwgdXNlckRhdGEsIG5vdGlmaWNhdGlvbikge1xyXG5cclxuICAgICAgICAkc2NvcGUudG93bnMgPSB0b3duc0RhdGEuZ2V0VG93bnMoKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24gKHVzZXIpIHtcclxuICAgICAgICAgICAgdXNlckRhdGEucmVnaXN0ZXIodXNlcilcclxuICAgICAgICAgICAgICAgIC4kcHJvbWlzZVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93SW5mbygnVXNlciBhY2NvdW50IGNyZWF0ZWQuIFBsZWFzZSBsb2cgaW4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnNob3dFcnJvcignSW52YWxpZCByZWdpc3RyYXRpb24nLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuY29udHJvbGxlcignUmlnaHRTaWRlYmFyQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRyb290U2NvcGUnLFxyXG4gICAgJ3Rvd25zRGF0YScsXHJcbiAgICAnY2F0ZWdvcmllc0RhdGEnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgdG93bnNEYXRhLCBjYXRlZ29yaWVzRGF0YSkge1xyXG5cclxuICAgICAgICAkc2NvcGUuY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXNEYXRhLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgICAkc2NvcGUudG93bnMgPSB0b3duc0RhdGEuZ2V0VG93bnMoKTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhdGVnb3J5Q2xpY2tlZCA9IGZ1bmN0aW9uIChjbGlja2VkQ2F0ZWdvcnlJZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRDYXRlZ29yeUlkID0gY2xpY2tlZENhdGVnb3J5SWQ7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnY2F0ZWdvcnlTZWxlY3Rpb25DaGFuZ2VkJywgY2xpY2tlZENhdGVnb3J5SWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS50b3duQ2xpY2tlZCA9IGZ1bmN0aW9uIChjbGlja2VkVG93bklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZFRvd25JZCA9IGNsaWNrZWRUb3duSWQ7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndG93blNlbGVjdGlvbkNoYW5nZWQnLCBjbGlja2VkVG93bklkKTtcclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuY29udHJvbGxlcignU3RhdHVzRmlsdGVyQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRyb290U2NvcGUnLFxyXG4gICAgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSkge1xyXG5cclxuICAgICAgICAkc2NvcGUuc3RhdHVzQ2xpY2tlZCA9IGZ1bmN0aW9uIChzZWxlY3RlZFN0YXR1c0lkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZFN0YXR1c0lkID0gc2VsZWN0ZWRTdGF0dXNJZDtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzdGF0dXNTZWxlY3Rpb25DaGFuZ2VkJywgc2VsZWN0ZWRTdGF0dXNJZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5jb250cm9sbGVyKCdVc2VyQWRzQ3RybCcsIFtcclxuICAgICckc2NvcGUnLFxyXG4gICAgJyRyb3V0ZScsXHJcbiAgICAnYWRzRGF0YScsXHJcbiAgICAndXNlckFkc0RhdGEnLFxyXG4gICAgJ3VzZXJEYXRhJyxcclxuICAgICdwYWdlU2l6ZScsXHJcbiAgICAnbm90aWZpY2F0aW9uJyxcclxuICAgIGZ1bmN0aW9uICgkc2NvcGUsICRyb3V0ZSwgYWRzRGF0YSwgdXNlckFkc0RhdGEsIHVzZXJEYXRhLCBwYWdlU2l6ZSwgbm90aWZpY2F0aW9uKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5ob21lTGluayA9ICd1c2VyL2hvbWUnO1xyXG4gICAgICAgICRzY29wZS5pbk15QWRzID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUucmVhZHkgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuYWRzUGFyYW1zID0ge1xyXG4gICAgICAgICAgICAnc3RhcnRQYWdlJzogMSxcclxuICAgICAgICAgICAgJ3BhZ2VTaXplJzogcGFnZVNpemVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUucmVsb2FkQWRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB1c2VyQWRzRGF0YS5nZXRVc2VyQWRzKCRzY29wZS5hZHNQYXJhbXMpXHJcbiAgICAgICAgICAgICAgICAuJHByb21pc2VcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc3VjY2VzcyhkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFkcyA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnJlYWR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5zaG93RXJyb3IoJ0Nhbm5vdCBsb2FkIGFkcycsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUucmVsb2FkQWRzKCk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2NhdGVnb3J5U2VsZWN0aW9uQ2hhbmdlZCcsIGZ1bmN0aW9uIChldmVudCwgc2VsZWN0ZWRDYXRlZ29yeUlkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hZHNQYXJhbXMuY2F0ZWdvcnlJZCA9IHNlbGVjdGVkQ2F0ZWdvcnlJZDtcclxuICAgICAgICAgICAgJHNjb3BlLmFkc1BhcmFtcy5zdGFydFBhZ2UgPSAxO1xyXG4gICAgICAgICAgICAkc2NvcGUucmVsb2FkQWRzKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3Rvd25TZWxlY3Rpb25DaGFuZ2VkJywgZnVuY3Rpb24gKGV2ZW50LCBzZWxlY3RlZFRvd25JZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYWRzUGFyYW1zLnRvd25JZCA9IHNlbGVjdGVkVG93bklkO1xyXG4gICAgICAgICAgICAkc2NvcGUuYWRzUGFyYW1zLnN0YXJ0UGFnZSA9IDE7XHJcbiAgICAgICAgICAgICRzY29wZS5yZWxvYWRBZHMoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignc3RhdHVzU2VsZWN0aW9uQ2hhbmdlZCcsIGZ1bmN0aW9uIChldmVudCwgc2VsZWN0ZWRTdGF0dXNJZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYWRzUGFyYW1zLnN0YXR1cyA9IHNlbGVjdGVkU3RhdHVzSWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5hZHNQYXJhbXMuc3RhcnRQYWdlID0gMTtcclxuICAgICAgICAgICAgJHNjb3BlLnJlbG9hZEFkcygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuY29udHJvbGxlcignVXNlckhvbWVDdHJsJywgW1xyXG4gICAgJyRzY29wZScsXHJcbiAgICAnJGxvY2F0aW9uJyxcclxuICAgICckcm91dGUnLFxyXG4gICAgJ3VzZXJEYXRhJyxcclxuICAgICdhdXRoZW50aWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sICRyb3V0ZSwgdXNlckRhdGEsIGF1dGhlbnRpY2F0aW9uKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5ob21lTGluayA9ICd1c2VyL2hvbWUnO1xyXG4gICAgICAgICRzY29wZS5hdXRoZW50aWNhdGlvbiA9IGF1dGhlbnRpY2F0aW9uO1xyXG4gICAgICAgICRzY29wZS5pc0xvZ2dlZEluID0gYXV0aGVudGljYXRpb24uaXNMb2dnZWRJbigpO1xyXG4gICAgICAgICRzY29wZS5pbkhvbWUgPSAkbG9jYXRpb24uJCRwYXRoID09ICcvdXNlci9ob21lJztcclxuICAgICAgICAkc2NvcGUuaW5NeUFkcyA9ICRsb2NhdGlvbi4kJHBhdGggPT0gJy91c2VyL2Fkcyc7XHJcbiAgICAgICAgJHNjb3BlLmluUHVibGlzaE5ldyA9ICRsb2NhdGlvbi4kJHBhdGggPT0gJy91c2VyL2Fkcy9wdWJsaXNoJztcclxuXHJcbiAgICAgICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgICAgIHVzZXJEYXRhLmxvZ291dCh1c2VyKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24uJCRwYXRoID09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgJHJvdXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmZhY3RvcnkoJ2F1dGhlbnRpY2F0aW9uJywgW1xyXG4gICAgJ2xvY2FsU3RvcmFnZVNlcnZpY2UnLFxyXG4gICAgZnVuY3Rpb24gKGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgdmFyIGtleSA9ICd1c2VyJztcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2F2ZVVzZXJEYXRhKGRhdGEpIHtcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoa2V5LCBkYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFVzZXJEYXRhKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoa2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZVVzZXIoKSB7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdscy51c2VyJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRIZWFkZXJzKCkge1xyXG4gICAgICAgICAgICB2YXIgaGVhZGVycyA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSBnZXRVc2VyRGF0YSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVzZXJEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmVhcmVyICcgKyB1c2VyRGF0YS5hY2Nlc3NfdG9rZW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaXNBZG1pbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGdldFVzZXJEYXRhKCkuaXNBZG1pbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzTG9nZ2VkSW4oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWdldFVzZXJEYXRhKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzYXZlVXNlcjogc2F2ZVVzZXJEYXRhLFxyXG4gICAgICAgICAgICBnZXRVc2VyRGF0YTogZ2V0VXNlckRhdGEsXHJcbiAgICAgICAgICAgIHJlbW92ZVVzZXI6IHJlbW92ZVVzZXIsXHJcbiAgICAgICAgICAgIGdldEhlYWRlcnM6IGdldEhlYWRlcnMsXHJcbiAgICAgICAgICAgIGlzQWRtaW46IGlzQWRtaW4sXHJcbiAgICAgICAgICAgIGlzTG9nZ2VkSW46IGlzTG9nZ2VkSW5cclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5mYWN0b3J5KFxyXG4gICAgJ25vdGlmaWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2hvd0luZm86IGZ1bmN0aW9uIChtc2cpIHtcclxuICAgICAgICAgICAgICAgIG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmZvJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAndG9wQ2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3dFcnJvcjogZnVuY3Rpb24gKG1zZywgc2VydmVyRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIENvbGxlY3QgZXJyb3JzIHRvIGRpc3BsYXkgZnJvbSB0aGUgc2VydmVyIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JzID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VydmVyRXJyb3IgJiYgc2VydmVyRXJyb3IuZGF0YS5lcnJvcl9kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHNlcnZlckVycm9yLmRhdGEuZXJyb3JfZGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJFcnJvciAmJiBzZXJ2ZXJFcnJvci5kYXRhLm1vZGVsU3RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWxTdGF0ZUVycm9ycyA9IHNlcnZlckVycm9yLmRhdGEubW9kZWxTdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gbW9kZWxTdGF0ZUVycm9ycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlcyA9IG1vZGVsU3RhdGVFcnJvcnNbcHJvcGVydHlOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyaW1tZWROYW1lID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZS5zdWJzdHIocHJvcGVydHlOYW1lLmluZGV4T2YoJy4nKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RXJyb3IgPSBlcnJvck1lc3NhZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzLnB1c2godHJpbW1lZE5hbWUgKyAnIC0gJyArIGN1cnJlbnRFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbXNnID0gbXNnICsgXCI6PGJyPlwiICsgZXJyb3JzLmpvaW4oXCI8YnI+XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG5vdHkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtc2csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ3RvcENlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuZGlyZWN0aXZlKCdjYXRlZ29yaWVzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb250cm9sbGVyOiAnUmlnaHRTaWRlYmFyQ3RybCcsXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kaXJlY3RpdmVzL2NhdGVnb3JpZXMuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmRpcmVjdGl2ZSgnY2hhbmdlVGl0bGVPbkJsdXInLFtcclxuICAgIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBzY29wZTogdHJ1ZSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gJ0FkcyAtICcgKyBzY29wZS50aXRsZTtcclxuXHJcbiAgICAgICAgICAgICQod2luZG93KS5mb2N1cyhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9ICdBZHMgLSAnICsgc2NvcGUudGl0bGU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJCh3aW5kb3cpLmJsdXIoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSAnSSBtaXNzIHlvdS4uJztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XSk7XHJcbiIsImFkc0FwcC5kaXJlY3RpdmUoJ2RpSHJlZicsIFsnJGxvY2F0aW9uJywgJyRyb3V0ZScsXHJcbiAgICBmdW5jdGlvbiAoJGxvY2F0aW9uLCAkcm91dGUpIHtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ2RpSHJlZicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhdHRycy5kaUhyZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmF0dHIoJ2hyZWYnLCBhdHRycy5kaUhyZWYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJyMnICsgJGxvY2F0aW9uLnBhdGgoKSA9PSBhdHRycy5kaUhyZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm91dGUucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5kaXJlY3RpdmUoJ2xvZ2dlZEluU2lkZWJhcicsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJyxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2RpcmVjdGl2ZXMvbG9nZ2VkLWluLXNpZGViYXIuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmRpcmVjdGl2ZSgnbWFuYWdlQWRNZW51JywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb250cm9sbGVyOiAnTWFuYWdlQWRNZW51Q3RybCcsXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kaXJlY3RpdmVzL21hbmFnZS1hZC1tZW51Lmh0bWwnLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWVcclxuICAgIH1cclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5kaXJlY3RpdmUoJ25hdmlnYXRpb24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGlyZWN0aXZlcy9uYXZpZ2F0aW9uLmh0bWwnLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWVcclxuICAgIH1cclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5kaXJlY3RpdmUoJ3B1YmxpY0FkcycsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29udHJvbGxlcjogJ1B1YmxpY0Fkc0N0cmwnLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGlyZWN0aXZlcy9wdWJsaWMtYWRzLmh0bWwnLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWVcclxuICAgIH1cclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFkc0FwcC5kaXJlY3RpdmUoJ3B1YmxpY0xlZnRTaWRlYmFyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGlyZWN0aXZlcy9sZWZ0LXNpZGViYXIuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmRpcmVjdGl2ZSgnc3RhdHVzRmlsdGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb250cm9sbGVyOiAnU3RhdHVzRmlsdGVyQ3RybCcsXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kaXJlY3RpdmVzL3N0YXR1cy1maWx0ZXIuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmRpcmVjdGl2ZSgndG93bnMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSaWdodFNpZGViYXJDdHJsJyxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2RpcmVjdGl2ZXMvdG93bnMuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmRpcmVjdGl2ZSgndXNlckFkcycsIGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXJBZHNDdHJsJyxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2RpcmVjdGl2ZXMvdXNlci1hZHMuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxyXG4gICAgfVxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmZhY3RvcnkoJ2Fkc0RhdGEnLCBbXHJcbiAgICAnJHJlc291cmNlJyxcclxuICAgICdhdXRoZW50aWNhdGlvbicsXHJcbiAgICAnYmFzZVNlcnZpY2VVcmwnLFxyXG4gICAgZnVuY3Rpb24gKCRyZXNvdXJjZSwgYXV0aGVudGljYXRpb24sIGJhc2VTZXJ2aWNlVXJsKSB7XHJcbiAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKGJhc2VTZXJ2aWNlVXJsICsgJ2Fkcy86YWRJZCcsIHthZElkOiAnQGlkJ30sIHtcclxuICAgICAgICAgICAgdXBkYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldEFsbDoge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUFkKGFkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5zYXZlKGFkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFB1YmxpY0FkcyhwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlLmdldEFsbChwYXJhbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZWRpdEFkKGFkSWQsIGFkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS51cGRhdGUoe2lkOiBhZElkfSwgYWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYWRkOiBjcmVhdGVBZCxcclxuICAgICAgICAgICAgZ2V0UHVibGljQWRzOiBnZXRQdWJsaWNBZHMsXHJcbiAgICAgICAgICAgIGVkaXQ6IGVkaXRBZFxyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmZhY3RvcnkoJ2NhdGVnb3JpZXNEYXRhJywgW1xyXG4gICAgJyRyZXNvdXJjZScsXHJcbiAgICAnYmFzZVNlcnZpY2VVcmwnLFxyXG4gICAgZnVuY3Rpb24gKCRyZXNvdXJjZSwgYmFzZVNlcnZpY2VVcmwpIHtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKGJhc2VTZXJ2aWNlVXJsICsgJ2NhdGVnb3JpZXMnKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q2F0ZWdvcmllcygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlLnF1ZXJ5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRDYXRlZ29yaWVzOiBnZXRDYXRlZ29yaWVzXHJcbiAgICAgICAgfVxyXG4gICAgfV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hZHNBcHAuZmFjdG9yeSgndG93bnNEYXRhJywgW1xyXG4gICAgJyRyZXNvdXJjZScsXHJcbiAgICAnYmFzZVNlcnZpY2VVcmwnLFxyXG4gICAgZnVuY3Rpb24gKCRyZXNvdXJjZSwgYmFzZVNlcnZpY2VVcmwpIHtcclxuXHJcbiAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKGJhc2VTZXJ2aWNlVXJsICsgJ3Rvd25zJyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRvd25zKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb3VyY2UucXVlcnkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldFRvd25zOiBnZXRUb3duc1xyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmZhY3RvcnkoJ3VzZXJBZHNEYXRhJywgW1xyXG4gICAgJyRyZXNvdXJjZScsXHJcbiAgICAnYXV0aGVudGljYXRpb24nLFxyXG4gICAgJ2Jhc2VTZXJ2aWNlVXJsJyxcclxuICAgIGZ1bmN0aW9uICgkcmVzb3VyY2UsIGF1dGhlbnRpY2F0aW9uLCBiYXNlU2VydmljZVVybCkge1xyXG5cclxuICAgICAgICB2YXIgcmVzb3VyY2UgPSAkcmVzb3VyY2UoYmFzZVNlcnZpY2VVcmwgKyAndXNlci9hZHMvOmFkSWQnLCB7YWRJZDogJ0BpZCd9LCB7XHJcbiAgICAgICAgICAgIHVwZGF0ZToge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGF1dGhlbnRpY2F0aW9uLmdldEhlYWRlcnMoKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXRBbGw6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBhdXRoZW50aWNhdGlvbi5nZXRIZWFkZXJzKClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogYXV0aGVudGljYXRpb24uZ2V0SGVhZGVycygpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbW92ZToge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGF1dGhlbnRpY2F0aW9uLmdldEhlYWRlcnMoKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzYXZlOiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGF1dGhlbnRpY2F0aW9uLmdldEhlYWRlcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU5ld0FkKGFkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5zYXZlKGFkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFVzZXJBZHMocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5nZXRBbGwocGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEFkQnlJZChhZElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5nZXQoe2FkSWQ6IGFkSWR9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVkaXRBZChhZElkLCBhZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb3VyY2UudXBkYXRlKHthZElkOiBhZElkfSwgYWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGVhY3RpdmF0ZUFkKGFkSWQpIHtcclxuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKGJhc2VTZXJ2aWNlVXJsICsgJ3VzZXIvYWRzL2RlYWN0aXZhdGUvOmFkSWQnLCB7YWRJZDogJ0BpZCd9LCB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IGF1dGhlbnRpY2F0aW9uLmdldEhlYWRlcnMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS51cGRhdGUoe2lkOiBhZElkfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwdWJsaXNoQWdhaW5BZChhZElkKSB7XHJcbiAgICAgICAgICAgIHZhciByZXNvdXJjZSA9ICRyZXNvdXJjZShiYXNlU2VydmljZVVybCArICd1c2VyL2Fkcy9wdWJsaXNoYWdhaW4vOmFkSWQnLCB7YWRJZDogJ0BpZCd9LCB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IGF1dGhlbnRpY2F0aW9uLmdldEhlYWRlcnMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS51cGRhdGUoe2lkOiBhZElkfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVBZChhZElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5yZW1vdmUoe2FkSWQ6IGFkSWR9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFkZDogY3JlYXRlTmV3QWQsXHJcbiAgICAgICAgICAgIGdldFVzZXJBZHM6IGdldFVzZXJBZHMsXHJcbiAgICAgICAgICAgIGdldEFkQnlJZDogZ2V0QWRCeUlkLFxyXG4gICAgICAgICAgICBlZGl0OiBlZGl0QWQsXHJcbiAgICAgICAgICAgIGRlYWN0aXZhdGU6IGRlYWN0aXZhdGVBZCxcclxuICAgICAgICAgICAgcHVibGlzaEFnYWluOiBwdWJsaXNoQWdhaW5BZCxcclxuICAgICAgICAgICAgZGVsZXRlOiByZW1vdmVBZFxyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYWRzQXBwLmZhY3RvcnkoJ3VzZXJEYXRhJywgW1xyXG4gICAgJyRodHRwJyxcclxuICAgICckcmVzb3VyY2UnLFxyXG4gICAgJ2Jhc2VTZXJ2aWNlVXJsJyxcclxuICAgICdhdXRoZW50aWNhdGlvbicsXHJcbiAgICBmdW5jdGlvbiAoJGh0dHAsICRyZXNvdXJjZSwgYmFzZVNlcnZpY2VVcmwsIGF1dGhlbnRpY2F0aW9uKSB7XHJcblxyXG4gICAgICAgIHZhciB1c2VyU2VydmljZVVybCA9IGJhc2VTZXJ2aWNlVXJsICsgJ3VzZXIvJztcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VXNlclByb2ZpbGUoKSB7XHJcbiAgICAgICAgICAgIHZhciByZXNvdXJjZSA9ICRyZXNvdXJjZSh1c2VyU2VydmljZVVybCArICdwcm9maWxlJywge30sIHtcclxuICAgICAgICAgICAgICAgIGdldDoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogYXV0aGVudGljYXRpb24uZ2V0SGVhZGVycygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlLmdldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVnaXN0ZXJVc2VyKHVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRyZXNvdXJjZSh1c2VyU2VydmljZVVybCArICdyZWdpc3RlcicpXHJcbiAgICAgICAgICAgICAgICAuc2F2ZSh1c2VyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZ2luVXNlcih1c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciByZXNvdXJjZSA9ICRyZXNvdXJjZSh1c2VyU2VydmljZVVybCArICdsb2dpbicpXHJcbiAgICAgICAgICAgICAgICAuc2F2ZSh1c2VyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc291cmNlLiRwcm9taXNlXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uLnNhdmVVc2VyKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZWRpdFVzZXJQcm9maWxlKHVzZXIpIHtcclxuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKHVzZXJTZXJ2aWNlVXJsICsgJ3Byb2ZpbGUnLCB7fSwge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBhdXRoZW50aWNhdGlvbi5nZXRIZWFkZXJzKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb3VyY2UudXBkYXRlKHVzZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hhbmdlVXNlclBhc3N3b3JkKHBhc3MpIHtcclxuICAgICAgICAgICAgdmFyIHJlc291cmNlID0gJHJlc291cmNlKHVzZXJTZXJ2aWNlVXJsICsgJ2NoYW5nZVBhc3N3b3JkJywge30sIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogYXV0aGVudGljYXRpb24uZ2V0SGVhZGVycygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlLnVwZGF0ZShwYXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZ291dCgpIHtcclxuICAgICAgICAgICAgYXV0aGVudGljYXRpb24ucmVtb3ZlVXNlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0VXNlclByb2ZpbGU6IGdldFVzZXJQcm9maWxlLFxyXG4gICAgICAgICAgICByZWdpc3RlcjogcmVnaXN0ZXJVc2VyLFxyXG4gICAgICAgICAgICBsb2dpbjogbG9naW5Vc2VyLFxyXG4gICAgICAgICAgICBlZGl0OiBlZGl0VXNlclByb2ZpbGUsXHJcbiAgICAgICAgICAgIGNoYW5nZVBhc3N3b3JkOiBjaGFuZ2VVc2VyUGFzc3dvcmQsXHJcbiAgICAgICAgICAgIGxvZ291dDogbG9nb3V0XHJcbiAgICAgICAgfVxyXG4gICAgfV0pO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

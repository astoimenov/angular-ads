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

adsApp.run(function ($rootScope, $location, authentication) {

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });

    $rootScope.$on('$locationChangeStart', function () {
        if ($location.path().indexOf('/user/') != -1 && !authentication.isLoggedIn()) {
            // Authorization check: anonymous site visitors cannot access user routes
            $location.path('/');
        }
    });
});

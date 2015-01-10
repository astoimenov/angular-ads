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

'use strict';

angular.module('cmp.input', [])
.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
})
.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) { return ''; }

        max = parseInt(max, 10);
        if (!max) { return value; }
        if (value.length <= max) { return value; }

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

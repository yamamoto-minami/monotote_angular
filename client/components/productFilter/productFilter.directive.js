'use strict';

angular.module('cmp.productFilter', [])
.directive('productFilter', function() {
    return {
        restrict: 'E',
        templateUrl: 'components/productFilter/productFilter.html',
        controller: 'productFilterCtrl',
        scope: {
            filters: '=',
            selection: '=',
            universe: '='
        }
    };
})


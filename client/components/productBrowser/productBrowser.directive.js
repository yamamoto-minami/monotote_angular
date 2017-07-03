'use strict';

angular.module('cmp.productBrowser')
.directive('productBrowser', function () {
  return {
    templateUrl: 'components/productBrowser/productBrowser.html',
    restrict: 'E',
    controller: 'productBrowserCtrl'
  };
});

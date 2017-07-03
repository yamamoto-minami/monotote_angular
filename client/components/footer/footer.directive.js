'use strict';

angular.module('cmp.siteFooter', [])
  .directive('siteFooter', function () {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      controller: function($scope){
        $scope.copyrightYear = new Date().getFullYear();
      }
    };
  });

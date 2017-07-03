'use strict';

angular.module('cmp.hotspotPanel')
.directive('hotspotPanel', function() {
   return {
        restrict: 'E',
        templateUrl: 'components/hotspotPanel/hotspotPanel.html',
        controller: 'hotspotPanelCtrl'
   };
});

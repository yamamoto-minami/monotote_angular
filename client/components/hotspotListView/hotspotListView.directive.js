'use strict';

angular.module('cmp.hotspotListView')
  .directive('hotspotListView', function () {
    return {
      templateUrl: function(elem, attr){
        return 'components/hotspotListView/hotspotListView-' + attr.type + '.html';
      },
      restrict: 'E',
      replace: true,
      scope: {
        hotspots: '=hotspots'
      },
      controller: 'hotspotListViewCtrl'
    };
  });

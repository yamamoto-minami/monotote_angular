'use strict';

angular.module('cmp.hotspotView', ['cmp.youtube', 'cmp.hotspot'])
.controller('hotspotViewCtrl', function($scope, HotspotService) {

    $scope.active = false;

    $scope.select = function(evt, hotspot) {
        $scope.active = true;
        HotspotService.active(hotspot);
        evt.preventDefault();
        evt.stopPropagation();
    };

    $scope.$on('hotspot.select', function(evt, hotspot) {
        if (hotspot.id === $scope.hotspot.id && !$scope.active) {
            $scope.active = true;
        }
    });

    $scope.$on('hotspot.deselect', function(evt, hotspot) {
        if (hotspot.id === $scope.hotspot.id) {
            $scope.active = false;
        }
    });
});

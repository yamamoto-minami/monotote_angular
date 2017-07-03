'use strict';

angular.module('cmp.hotspotPanel', [])
.controller('hotspotPanelCtrl', function($scope, TAGGING_DROPLETS, TAGGING_TYPES) {

    $scope.hotspot = null;
    $scope.droplets = TAGGING_DROPLETS;
    $scope.styles = TAGGING_TYPES;

    $scope.$on('hotspot.select', function(evt, hotspot) {
        $scope.hotspot = hotspot;
    });

    $scope.color = function(color) {
        if ($scope.hotspot) {
            $scope.hotspot.color = color;
            $scope.hotspot.dirty = true; // dirty droplets will be redrawn by the hotspotView directive
        }
    };

    $scope.isChecked = function(type){
        var myType = 1;
        if ($scope.hotspot) {
            if($scope.hotspot.type === 0 || $scope.hotspot.type === 1 && type === 0){
                $scope.hotspot.type = 1;
                return true;
            } else {
                myType = $scope.hotspot.type;
            }
        }
        return (myType === type);
    };

    $scope.type = function(type) {
        if ($scope.hotspot) {
            $scope.hotspot.type = type;
            $scope.hotspot.dirty = true; // dirty droplets will be redrawn by the hotspotView directive
        }
    };

});

'use strict';

angular.module('cmp.hotspotListView', [])
.controller('hotspotListViewCtrl', function($scope, videoService, HotspotService, SCT_CONFIG, Env) {

    $scope.VideoService = videoService;

    $scope.select = function(hotspot, seconds) {
        if (typeof seconds !== 'undefined') {
          videoService.setCurrentTime(seconds);
        }
        HotspotService.active(hotspot);
        $scope.$emit('hotspot.edit', hotspot);
    };

    $scope.setCurrentTime = function(evt, seconds) {
      videoService.setCurrentTime(seconds);
    };

    $scope.removeHotspot = function(hotspot) {
      var idx = $scope.hotspots.indexOf(hotspot);
      if (idx !== -1) {
        $scope.hotspots.splice(idx, 1);
      }
    };

    $scope.formatTime = function(seconds){
      var min = Math.floor(seconds / 60);
      var sec = Math.round(seconds % 60);
      return (min < 10? '0' + min : min) + ':' + (sec < 10? '0' + sec : sec);
    };

    $scope.thumbnail = function(sku) {
      return sku ? SCT_CONFIG.environments[Env].imageUrl + sku + '/0?mw=100&mh=80' : '/img/assets/0.jpeg';
    };

    $scope.productName = function(hotspot) {
      return hotspot.product ? hotspot.product : '';
    };

});

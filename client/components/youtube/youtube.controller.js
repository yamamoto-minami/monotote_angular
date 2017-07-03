'use strict';

angular.module('cmp.youtube')
.controller('youtubeController', function($scope, $sce, videoService, VideoStates){
    $scope.ytcontrol = {};
    $scope.progress = 0;
    $scope.state = VideoStates.UNSTARTED;
    var provider = videoService.provider = {
      setCurrentTime: setCurrentTime
    };

    $scope.$on('youtube.player.initialized', function () {
      // 'enable' video controller interface
      $scope.state = VideoStates.UNDEFINED;
    });

    $scope.$on('youtube.player.error', function($event){
      $scope.onShoppableFrameLoadError();
    });

    $scope.$on('youtube.player.2', function($event){ // playing state
      $scope.onShoppableFrameLoadSuccess();
    })
    $scope.$on('youtube.player.3', function($event){ // paused state
      $scope.onShoppableFrameLoadSuccess();
    })

    $scope.$on('youtube.player.progress', function ($event, player, progress) {
      $scope.progress = progress.percent;
      videoService.current = progress.current;
      videoService.total = progress.total;
    });

    $scope.$watch('progress', function() {
      videoService.progress = $scope.progress;
    });

    $scope.setProgress = function(percent) {
      if ($scope.ytcontrol && $scope.ytcontrol.progress) {
        $scope.ytcontrol.progress(percent);
      }
    };

    $scope.pauseVideo = function() {
      $scope.ytcontrol.pause();
      $scope.state = VideoStates.PAUSED;
    };

    $scope.playVideo = function() {
      $scope.ytcontrol.play();
      $scope.state = VideoStates.PLAYING;
    };

    $scope.onVideoRangeSlide = function(value) {
      if ($scope.state !== VideoStates.PAUSED) {
          $scope.pauseVideo();
      }
      $scope.ytcontrol.setCurrentTime(value);
      $scope.$emit('player.setProgress', value);
    };

    $scope.$on('$destroy', function(){
      if(provider === videoService.provider)
        videoService.provider = null;
    })

    function setCurrentTime(seconds)
    {
        $scope.ytcontrol.setCurrentTime && $scope.ytcontrol.setCurrentTime(seconds);
    }

});

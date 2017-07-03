(function(){
	"use strict";

	angular
	.module('cmp.html5player')
	.controller('Html5PlayerController', Html5PlayerController);

	Html5PlayerController.$inject = ['$scope', '$sce', '$interval', 'videoService'];
	function Html5PlayerController($scope, $sce, $interval, videoService)
	{
		$scope.pauseVideo = pauseVideo;
		$scope.playVideo = playVideo;
		$scope.update = update;
		$scope.configurePlayer = configurePlayer;
		$scope.onVideoRangeSlide = onVideoRangeSlide;
		$scope.videoLoaded = false;
		var videoTag = null
		var provider = videoService.provider = {
      		setCurrentTime: setCurrentTime
    	};

		$scope.$on('$destroy', function(){
      		if(provider === videoService.provider)
        		videoService.provider = null;
			pauseVideo();
    	});

		function update() {
			$scope.videoLoaded = true;
			$scope.progress = videoTag.currentTime / videoTag.duration * 100;
      		videoService.current = videoTag.currentTime||0;
      		videoService.total = videoTag.duration||0;
		}

		function pauseVideo() {
			videoTag.pause();
		}

		function playVideo() {
			videoTag.play();
		}

    	function onVideoRangeSlide(value) {
			if(!videoTag.paused) {
          		$scope.pauseVideo();
      		}
      		setCurrentTime(value);
			$scope.$emit('player.setProgress', value);
    	}

		function setCurrentTime(seconds) {
			videoTag.currentTime = seconds;
			pauseVideo();
		}

		function configurePlayer(video) {
			videoTag = $scope.videoTag = video;
		}
	}
})();
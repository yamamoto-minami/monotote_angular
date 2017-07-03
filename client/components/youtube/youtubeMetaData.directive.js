(function(){
	"use strict";

	angular
	.module('cmp.youtube')
	.directive('youtubeMetaData', YoutubeMetaDataDirective);

	YoutubeMetaDataDirective.$inject = ['$interval','$log']
	function YoutubeMetaDataDirective($interval,$log)
	{
		var config = {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs)
		{
			scope.$on('youtube.player.ready', onPlayerReady);

			function onPlayerReady(event, player) {
        		var meta = scope.videoMetaData = player.getVideoData();
        		var retry;
        		// author metadata seems to be added at a later point
        		// try for a few seconds to get author name
        		if (typeof meta.author === 'string' && !meta.author.length) {
            		retry = $interval(function() {
                		meta = player.getVideoData();
                		if (meta.author.length) {
                    		scope.videoMetaData = meta;
                    		$interval.cancel(retry);
                		}
            		}, 250, 5);
        		}
    		}
		}

		return config;
	}
})();
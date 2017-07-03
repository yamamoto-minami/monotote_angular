(function(){
	"use strict";

	angular
	.module('cmp.html5player')
	.directive('htmlVideoPlayer', VideoPlayerDirective)

	function VideoPlayerDirective()
	{
		var config = {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs)
		{
			if(!element.is('video')) throw new Error('htmlVideoPlayer directive: invalid tag');
			
			scope.configurePlayer(element[0]);
			element.on('timeupdate', updateInfo);
			element.on('loadedmetadata', updateInfo);

			scope.$on('$destroy', function(){
				element.off('timeupdate', updateInfo);
				element.off('loadedmetadata', updateInfo);
			});

			function updateInfo(){
				scope.$apply(function(){
					scope.update();
				})
			}

		}

		return config;
	}
})();
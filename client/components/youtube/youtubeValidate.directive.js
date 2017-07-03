(function(){
	"use strict";

	angular
	.module('cmp.youtube')
	.directive('youtubeValidate', YoutubeValidateDirective)

	YoutubeValidateDirective.$inject = ['$sce'];
	function YoutubeValidateDirective($sce)
	{
		var config = {
			restrict:'A',
			link: link
		};

		function link($scope, element,attrs)
		{
			var videoId = ($scope.formData.videoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/) || []).pop();
			$scope.videoUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+videoId+'?controls=0&modestbranding=1&showinfo=0&wmode=opaque&iv_load_policy=3&playsinline=1&rel=0&html5=1&enablejsapi=1');
		}

		return config;
	}
})();
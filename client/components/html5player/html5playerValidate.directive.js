(function(){
	"use strict";

	angular
	.module('cmp.html5player')
	.directive('htmlVideoUrlValidate', HtmlVideoUrlValidateDirective)


	HtmlVideoUrlValidateDirective.$inject = ['$sce'];
	function HtmlVideoUrlValidateDirective($sce)
	{
		var config = {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs)
		{
			scope.videoUrl = $sce.trustAsResourceUrl(scope.formData.videoUrl);
		}

		return config;
	}
})();
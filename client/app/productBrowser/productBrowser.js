(function(){
	"use strict";

	angular
	.module('app.productBrowser', [
		'ui.router',
		'cmp.productBrowser'
	])
	.config(ProductBrowserConfig)
	.run(ProductBrowserCheckState);


	ProductBrowserConfig.$inject = ['$stateProvider'];
	function ProductBrowserConfig($stateProvider)
	{
		$stateProvider.state('productBrowser', {
            url: '/product-browser',
            authenticate: true,
			params: {
				manual: false
			}
        });
	}

	ProductBrowserCheckState.$inject = ['$rootScope','$state','SCT_CONFIG'];
	function ProductBrowserCheckState($rootScope,$state,SCT_CONFIG)
	{
		$rootScope.$on('$stateChangeStart', function(evt, next, toParams, fromState) {
			if(!toParams.manual && next.name === 'productBrowser') {
				evt.preventDefault();
				if(fromState.name === 'productBrowser' || fromState.abstract)
					$state.go(SCT_CONFIG.defaultRoute);
			}
		});
	}
})();
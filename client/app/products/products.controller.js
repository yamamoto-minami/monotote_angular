'use strict';

angular.module('app.products')
.controller('ProductsCtrl', function ($scope, $http, $q, $timeout, Shoppable, ATTENTION_STATE, TAGGING_STATE, TAGGING_TYPE, $state, ngDialog, $location, Auth, _, SCT_CONFIG,Env, $window, Notification) {

	$scope.search_panel = true;

	$scope.lookup = function () {

		if(($scope.product_sku) && ($scope.product_url)){
			Notification.error({
				positionX: 'center',
				message: 'Need only SKU or URL'
			})
		} else {
			if($scope.product_sku) {
				$state.transitionTo('products.detail', {type:'sku', value: $scope.product_sku});
			} else {
				$state.transitionTo('products.detail', {type:'url', value: $scope.product_url});
			}
		}
	}
});
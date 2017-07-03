'use strict';

angular.module('app.products')
.controller('ProductDetailCtrl', function ($scope, $http, $q, $timeout, Shoppable, ATTENTION_STATE, TAGGING_STATE, TAGGING_TYPE, $state, ngDialog, $location, Auth, _, SCT_CONFIG,Env, $window, $stateParams, Notification) {

	$scope.loading = true;
	$scope.search_panel = true;
	$scope.notFound = true;
	$scope.supported = false;

	var headers = {};

	var data = {}
	$scope.key = "";

	if($stateParams.type == 'sku') {
		data['type'] = 'sku';
		$scope.product_sku = data['value'] = $stateParams.value;
	} else {
		data['type'] = 'url';
		$scope.product_url = data['value'] = $stateParams.value;
	}

	$scope.key = data['value'] = $stateParams.value;

  $scope.getProductInformation = function (data) {
		Auth.getCurrentUser()
	  .then(function () {
	  	headers = angular.extend({}, Auth.getIdentity());

		  $http({
		    url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.lookupProduct,
		    method: 'POST',
		    headers: headers,
		    data : data,
		    api: true
		  })
		  .then(function (response) {
		  	$scope.loading = false;
		  	
		  	var statusCode = _.get(response.data, 'status.code');
		  	
		  	if(statusCode == 200) {
		  		$scope.notFound = false;
		  		$scope.product = response.data.body;
		  	} else {
		  		$scope.notFound = true;	
		  	}

		  }, function (error) {
		  	$scope.loading = false;
		  	$scope.notFound = true;
		  });
	  }); 	
  }

	$scope.download = function (event) {

		$scope.loading = true;

		var url = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.downloadProductImages.replace("{universe}", $scope.product.retailer.universe).replace("{sku}", $scope.product.internal_sku);

		$http({
	    url: url,
	    method: 'POST',
	    headers: headers,
	    data : data,
	    api: true
	  })
	  .then(function (response) {
	  	$scope.loading = false;
	  	$scope.download_url = response.data.body.url;
	  	window.location.assign($scope.download_url);

	  }, function (err) {
	  	$scope.loading = false;
	  })
	}

	$scope.success = function () {
    Notification.primary({
      positionX: 'center',
      message: 'Copied to clipboard!'
    });
  };

  $scope.fail = function (err) {
    Notification.warning({
      positionX: 'center',
      message: 'Error!'
    });
  };

  $scope.search_panel = true;

	$scope.lookup = function () {
		if($scope.product_sku) {
			$state.transitionTo('products.detail', {type:'sku', value: $scope.product_sku});
		} else {
			$state.transitionTo('products.detail', {type:'url', value: $scope.product_url});
		}
	}

	$scope.getProductInformation(data);

});
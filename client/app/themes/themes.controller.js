'use strict';

angular.module('app.tagging')
.controller('ThemesCtrl', function ($scope, $http, $q, $log, $timeout, $state, ThemeManagementService, ngDialog, $location, Auth, _, SCT_CONFIG,Env, $window, Notification) {

  $scope.view = "";
  $scope.loading = true;
  $scope.themes = [];
  var headers = {};

  $scope.getThemes = getThemes;
	$scope.makePreviewTheme = makePreviewTheme;

  getThemes();

  checkCorrectDevice();

  $(window).resize(function () {
		checkCorrectDevice();
  });
  
  function checkCorrectDevice() {
  	var width = window.innerWidth;

  	$timeout(function () {
  		$scope.$apply(function () {
  			if((width >= 320) && (width < 500)){
			  	$scope.view = "mobile_small";
			  } else if ((width >= 500) && (width < 1024)){
			  	$scope.view = "mobile_middle";
			  } else {
			  	$scope.view = "desktop";
			  }
  		});
  	},0);
  }

  function getThemes(){
	  return ThemeManagementService.getThemes()
	  .then(function (response) {
	  	$scope.loading = false;
	  	$scope.themes = response.data.body;
	  }, function (error) {
	  	$log.error(error);
	  	$scope.loading = false;
	  })
  };

	function makePreviewTheme(theme) {
		$window.localStorage.mntCurrentPluginTheme = theme.id;
		Notification.primary({
			positionX: 'center',
			message: 'The include code is updated for this theme'
		})
	}

  $scope.deleteTheme = function (theme) {
  	$scope.loading = true;
  	ThemeManagementService.removeTheme(theme.id)
	.then(function(){
	  return $q(function(resolve){
		$timeout(resolve, 1000); // put a delay to ensure the list will be up to date
	  })
	})
	.then(function () {
	  $log.debug('the theme is removed');
	  Notification.primary({
       	positionX: 'center',
        message: 'The theme was successfully removed!'
      })
	  return getThemes();
	}, function (error) {
	  $scope.loading = false;
	  Notification.error({
       	positionX: 'center',
        message: 'Unable to delete the theme!'
      })
	});
  }

  $scope.duplicate = function (theme) {

  	var data = {};
  	data = angular.extend({} , theme);

  	delete data.id;
  	delete data.updated_at;

  	$scope.loading = true;

  	$http({
	    url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.createTheme,
	    method: 'POST',
	    headers: headers,
	    data: data,
	    api: true
	  })
	  .then(function (response) {
	  	var newTheme_id = response.data.body;

	  	$http({
		    url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.getTheme.replace("{theme_id}" , newTheme_id),
		    method: 'GET',
		    headers: headers,
		    api: true
		  })
		  .then(function (res) {
		  	$scope.loading = false;
		  	$scope.themes.reverse().push(res.data.body);
		  	$scope.themes.reverse();
		  }, function (err) {
		  	$scope.loading = false;
		  });
	  }, function (error) {
	  	$scope.loading = false;
	  })
  }
});
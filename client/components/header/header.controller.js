'use strict';

angular.module('cmp.siteHeader', [])
.controller('SiteHeaderCtrl', function($location,$scope, $window, ngDialog, $rootScope, navMenu, SCT_CONFIG, Auth, Thumbnail) {

  $scope.menu = navMenu;
  $scope.profileImage = '';
  $scope.username = '';
  
  $scope.isActive = function(route) {
    return route === $location.path();
  };

  $scope.$on('user.set', function(){
    Auth.getCurrentUser()
    .then(function(currentUser){
      $scope.permissions = Auth.getFeaturesObj();
    });
  });

  $scope.$on('profile.update', function(evt, profile) {
    var username = '';

    if (profile.firstname) {
      username = profile.firstname;
    }
    if (profile.lastname) {
      username = username + ' ' + profile.lastname;
    }

    $scope.username = username;

    if (profile.image) {
      $scope.profileImage = profile.image;
    }
  });

  $scope.profileImageThumb = function() {
    var url = $scope.profileImage ? Thumbnail.size($scope.profileImage, 45, 45) :  SCT_CONFIG.defaultProfileImage;
    return $scope.profileImage ? Thumbnail.size($scope.profileImage, 45, 45) :  SCT_CONFIG.defaultProfileImage;
  };

  $scope.logout = function() {
    Auth.logout();
    $scope.profileImage = '';
    $location.path('/login');
  };
});

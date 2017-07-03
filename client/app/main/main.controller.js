'use strict';

angular.module('app.main', [])
.controller('mainCtrl', function($scope, $rootScope) {

   $rootScope.$on('user.set', function(){
     $scope.valid = true;
   });

   $rootScope.$on('user.unset', function(){
     $scope.valid = false;
   });

});

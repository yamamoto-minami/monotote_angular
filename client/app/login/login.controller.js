'use strict';

angular.module('app.login')
.controller('LoginCtrl', function ($scope, Auth, $state, SCT_CONFIG, $rootScope, $location, $log, ngDialog) {

  function showModal() {
    Auth.isLoggedInAsync(function(val){
      if(val) return $location.url("/");

      var dialog = ngDialog.open({
          templateUrl: 'app/login/login.html',
          showClose: false,
          closeByEscape: false,
          closeByDocument: false,
          overlay: false,
          disableAnimation: true,
          className: 'ngdialog-overlay login-dialog',
          controller: loginModalController
      });

      $scope.$on('$destroy', function(){
          dialog.close();
      });
    });
  }

  function loginModalController($scope) {
      $scope.user = {};
      $scope.errors = '';
      $scope.$watchGroup(['user.email','user.password'],clearApiErrors);
      $scope.submitting = false;
              
      function clearApiErrors(){
          $scope.errors = "";
      }

      $scope.login = function(form) {
          if (form.$valid && !$scope.submitting) {
              $scope.submitting = true;
              Auth.login({
                  email: $scope.user.email,
                  password: $scope.user.password
              })
              .then(function() {
                  if ($state.current.name === 'login') {
                      if ($rootScope.routerPrevState && $rootScope.routerPrevState.name) {
                          $state.go($rootScope.routerPrevState);
                      } else {
                          $state.go(SCT_CONFIG.defaultRoute);
                      }
                  }
                  $rootScope.$broadcast('user.set');
                  $scope.closeThisDialog();
             })
             .catch(function(err) {
                  $log.debug('login fail',err);
                  $scope.errors = err && err.text || 'Failed to log in: unknown error!';
             })
             .then(function(){
                  $scope.submitting = false;
             });
          }
      };
  }

  showModal();

});

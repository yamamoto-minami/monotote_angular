'use strict';

angular.module('app.confirmation')
.controller('confirmationCtrl', function ($q, $scope, $rootScope, $window, Publisher, Auth, $location, $state, $stateParams, ngDialog, GoogleAnalyticsService, SCT_CONFIG) {

  if (!$state.params.token || !$state.params.email) {
    return $state.go(SCT_CONFIG.defaultRoute, {
      replace: true,
      inherit: false
    });
  }

  showModal();

  function showModal() {
    Auth.isLoggedInAsync(function(val){
      if(val) return $location.url("/");

      var dialog = ngDialog.open({
          templateUrl: 'app/confirmation/confirmation.html',
          showClose: false,
          closeByEscape: false,
          closeByDocument: false,
          overlay: false,
          disableAnimation: true,
          className: 'ngdialog-overlay login-dialog',
          controller: confirmationModalController
      });

      $scope.$on('$destroy', function(){
          dialog.close();
      });
    });
  }

  function confirmationModalController($scope) {

    $scope.confirm = confirm;

    $scope.data = {};
    $scope.errors = '';
    $scope.$watch('user.password',clearApiErrors);
    $scope.submitting = false;


    $scope.message = '';
    $scope.messageType = '';

    function clearApiErrors(){
      $scope.errors = "";
    }

    function confirm(form) {
      if (!form.$valid || $scope.submitting) { return }
      $scope.submitting = true;
      Publisher.confirmation($stateParams.token, $stateParams.email, $scope.data.password)
      .then(function(res) {
        if(res.status.code !== 200) {
          return $q.reject(res.status.text);
        }
        return Auth.authorize(res.body.access_token);
      })
      .then(function(){
        $window.localStorage[SCT_CONFIG.tempPasswordStorageKey] = $scope.data.password;
        $rootScope.$broadcast('user.set');
        $state.go(SCT_CONFIG.defaultRoute, {
          replace: true,
          inherit: false
        });
        GoogleAnalyticsService.createEvent({
          eventCategory: 'Signup',
          eventAction: 'signupConfirm',
          eventLabel: 'Email confirmation'
        });
      })
      .catch(function(reason) {
        $scope.errors = typeof(reason) === 'string' ? reason : 'Tokens are invalid!';
      }).then(function(){
        $scope.submitting = false;
      });
    }
  }

});



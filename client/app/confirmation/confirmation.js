'use strict';

angular.module('app.confirmation', ['cmp.googleAnalytics'])
.config(function ($stateProvider) {
  $stateProvider
    .state('confirmation', {
      url: '/confirmation?token&email',
      controller: 'confirmationCtrl',
      authenticate: false
    });
});

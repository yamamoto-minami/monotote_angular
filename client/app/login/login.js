'use strict';

angular.module('app.login', [])
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        controller: 'LoginCtrl',
        keepRouterPrevState: true
      });
  });

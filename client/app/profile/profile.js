'use strict';

angular.module('app.profile', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('profile', {
      url: '/profile',
      templateUrl: 'app/profile/profile.html',
      controller: 'ProfileCtrl',
      authenticate: true,
      keepRouterPrevState: true
    })
    .state('changePassword', {
      url: '/change-password',
      templateUrl: 'app/profile/changePassword.html',
      controller: 'ChangePasswordController',
      authenticate: true,
      keepRouterPrevState: true
    })
    .state('affiliates', {
      url: '/affiliates/:company',
      templateUrl: 'app/profile/affiliates.html',
      controller: 'AffiliatesCtrl',
      authenticate: true,
      keepRouterPrevState: true,
      supportLink: 'https://support.monotote.com/hc/en-us/articles/213632549'
    });
});

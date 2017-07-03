'use strict';

angular.module('app.includecode', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('includecode', {
      url: '/include-code',
      templateUrl: 'app/includecode/includecode.html',
      controller: 'includeCodeCtrl',
      authenticate: true,
      supportLink: 'https://support.monotote.com/hc/en-us/articles/213632509'
    });
});

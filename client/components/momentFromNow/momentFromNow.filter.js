'use strict';

angular.module('cmp.moment', [])
  .filter('momentFromNow', function () {
    return function (input) {
      return moment.utc(input).local().fromNow();
    };
  });

'use strict';

angular.module('cmp.lodash', [])
.factory('_',
  function($window) {
    // place lodash include before angular
    return $window._;
  }
);

'use strict';

angular.module('app.analytics', ['cmp.d3', 'cmp.mixpanel', 'pikaday', 'cmp.lodash'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('analytics', {
        url: '/analytics?start-date&end-date',
        templateUrl: 'app/analytics/analytics.html',
        controller: 'AnalyticsCtrl',
        authenticate: true,
        tabpane: 'revenue-report'
      });
    $stateProvider
      .state('segmentationChart', {
        url: '/analytics/segmentation-chart?start-date&end-date&f',
        templateUrl: 'app/analytics/analytics.html',
        controller: 'AnalyticsCtrl',
        authenticate: true,
        tabpane: 'segmentation-report'
      });
  });

angular.module('app.orders', ['cmp.lodash', 'pikaday'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('ordersReport', {
        url: '/analytics/orders?start-date&end-date&period&retailers&sort&{ascending:true|false}',
        templateUrl: 'app/analytics/orders.html',
        controller: 'OrdersCtrl',
        authenticate: true,
        tabpane: 'orders-report'
      });
  });
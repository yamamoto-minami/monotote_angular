'use strict';

angular.module('app.products', [])
  .config(function ($stateProvider) {

    $stateProvider
      .state('products', {
        url: '/products',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('products.lookup', {
        url: '/lookup',
        templateUrl: 'app/products/products-lookup.html',
        controller: 'ProductsCtrl',
        authenticate: true
      })
      .state('products.detail', {
        url: '/lookup/:type/:value',
        templateUrl: 'app/products/product-detail.html',
        controller: 'ProductDetailCtrl',
        authenticate: true
      })
  });


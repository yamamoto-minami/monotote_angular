'use strict';

angular.module('app.test', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('test', {
      url: '/test',
      templateUrl: 'app/test/test.html',
      sidebar: false,
      controller: 'testCtrl'
    });
})
.controller('testCtrl', function($scope, ngDialog, $timeout, $rootScope) {

    $scope.product = null;
    $scope.universe = null;

    function showModal() {
        var productBrowser = ngDialog.open({
            templateUrl: 'components/productBrowser/modal.html',
            className: 'ngdialog-theme-productBrowser',
            showClose: false,
            closeByEscape: false,
            closeByDocument: false,
            overlay: false,
            disableAnimation: true,
            controller: 'productBrowserCtrl'
        });

        productBrowser.closePromise
        .then(function (data) {
            $scope.product = data.value.product;
            $scope.universe = data.value.universe;
        });

        $timeout(function() {
            $rootScope.$broadcast('product.doSearch', {
                universe: 'zalando',
                //universe: 'monotote',
                keywords: 'dress'.split(' '),
                //universe: 'amazon'
                //keywords: 'Vintage Floral Spring Party Cocktail Dress'.split(' ')
            });
        }, 800)
        .then(function() {
            $timeout(function() {
                //console.log('click', document.querySelector('.product-list__item a'));
                angular.element(document.querySelector('.product-list__item a')).trigger('click');
            }, 3500);
        });
        //.then(function() {
        //    $timeout(function() {
        //        console.log('click', document.querySelector('[data-item="Neiman Marcus"] a'));
        //        angular.element(document.querySelector('[data-item="Neiman Marcus"] a')).trigger('click');
        //    }, 5500);
        //})
        //.then(function() {
        //    $timeout(function() {
        //        console.log('click', document.querySelector('[data-item="Akris"] a'));
        //        angular.element(document.querySelector('[data-item="Akris"] a')).trigger('click');
        //    }, 6500);
        //})
        //.then(function() {
        //    $timeout(function() {
        //        console.log('click', document.querySelector('[data-item="black"] a'));
        //        angular.element(document.querySelector('[data-item="black"] a')).trigger('click');
        //    }, 8500);
        //})
        //.then(function() {
        //    $timeout(function() {
        //        console.log('click', document.querySelector('[data-item="485"] a'));
        //        angular.element(document.querySelector('[data-item="485"] a')).trigger('click');
        //    }, 10500);
        //});

    }

    $scope.openProductBrowser = function() {
        //console.log('openProductBrowser');
        showModal();
    };

    showModal();

});

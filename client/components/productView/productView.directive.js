'use strict';

angular.module('cmp.productView', [])
.directive('productView', function factory(SCT_CONFIG, Env) {
  var directiveDefinitionObject = {
      templateUrl: 'components/productView/productView.html',
      restrict: 'E',
      replace: true,
      link: function(scope) {
        scope.thumbnail = function(sku) {
          return sku ? SCT_CONFIG.environments[Env].imageUrl + sku + '/0?mw=120&mh=120' : '/assets/images/product-placeholder.gif';
        };
      }
  };

  return directiveDefinitionObject;
})
.directive('productDetail', function factory(SCT_CONFIG, Env) {
  var directiveDefinitionObject = {
      templateUrl: 'components/productView/productDetail.html',
      restrict: 'E',
      replace: false,
      scope: {
        product: '='
      },
      link: function(scope) {
        scope.thumbnail = function(sku) {
          return sku ? SCT_CONFIG.environments[Env].imageUrl + sku + '/0?mw=100&mh=80' : SCT_CONFIG.defaultThumbnailImage;
        };

        //scope.$watch('product', function(n, o) {
        //    if (n && n !== o) {
        //        Product.detail(scope.sku)
        //        .then(function(res) {
        //           scope.product = {
        //               name: _.get(res, 'product.name'),
        //               price: _.get(res, 'product.price_nice'),
        //               brand: _.get(res, 'product.partner_line')
        //           };
        //        });
        //    } else if (!n && scope.product) {
        //        scope.product = null;
        //    }
        //});
      }
  };

  return directiveDefinitionObject;
})
.directive('productQuickView', function ($window, $timeout, Product, PageLeaveLockService) {
  return {
      templateUrl: 'components/productView/productQuickView.html',
      restrict: 'E',
      scope: {
          universe: '=',
          product: '=',
          realProduct: '=',
          detail: '=',
          configuration: '='
      },
      link: function(scope) {
          scope.loading = {
              loadingIndicator: 'components/loader/loadingIndicator.html',
              show: false
          };
          
          scope.downloadProductImagesUrl = null;
          scope.getProductImages = function() {
              if (!scope.realProduct.sku) { return; }
              scope.loading.show = true;
              scope.downloadProductImagesUrl = null;
              Product.download(scope.universe, scope.realProduct.sku)
              .then(function(url) {
                scope.downloadProductImagesUrl = url;
                scope.temporalyUnlockPageLeave();      
                $window.location.href = url;
              })
              .finally(function(){
                scope.loading.show = false;
              });
          };

          scope.temporalyUnlockPageLeave = function(){
              PageLeaveLockService.unlock();
              $timeout(function(){
                  PageLeaveLockService.restore();
              })
          };

          scope.show = function(key, value) {
              // update 'filter'
              _.set(scope.configuration, key, value);
              // filter subproducts
              var p = scope.$parent.showSubProduct(scope.configuration);
              if (p) {
                scope.product = p;
              }
          };

          scope.$watch('product', function() {
            if ((scope.product === null) || (scope.product === undefined)) {
                scope.downloadProductImagesUrl = null;
            }
          });

      }
  };
})
.directive('productQuickViewImages', function (Thumbnail, SCT_CONFIG) {
  return {
      templateUrl: 'components/productView/productQuickView-images.html',
      restrict: 'E',
      scope: {
          product: '=',
          realProduct: '='
      },
      link: function(scope) {
        scope.sliderImageIndex = 0;
        scope.images = [];

        scope.data = (function(){
            var i;
            for(i = scope; i && !i.data; i = i.$parent);
            return i && i.data; 
        })();

        scope.closeThisDialog = (function(){
            var i;
            for(i = scope; i && !i.closeThisDialog; i = i.$parent);
            return i && i.closeThisDialog; 
        })();

        scope.$watch('product', function() {
            if (scope.product) {
                scope.image = (scope.product.images && scope.product.images.length) ?
                    scope.images = _.unique(scope.product.images) :
                    scope.images = [scope.product.thumb];
            }
            scope.sliderImageIndex = 0;
        });

        scope.thumbnail = function(url) {
          return typeof url === 'string' && url.length ? Thumbnail.size(url, 60, 60) : SCT_CONFIG.defaultThumbnailImage;
        };

        scope.selectProduct = function() {
            scope.$emit('product.select', scope.realProduct);
        };

        scope.backToSearch = function() {
            scope.$emit('product.search', scope.realProduct);
        };

        scope.showImage = function(index) {
            scope.sliderImageIndex = index;
        };

      }
  };
});

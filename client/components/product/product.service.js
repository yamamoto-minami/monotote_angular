'use strict';

angular.module('cmp.product', [])
  .factory('Product', function ($http, $timeout, SCT_CONFIG, Env, $q, Auth, _) {
    var parentFilter = {};
    var filterUniverse = null;
    var department = 'All';

    function fixPrices(product) {
      product.price = parseFloat(product.price);
      product.special_price = parseFloat(product.special_price);
      if(product.price === product.special_price) {
        product.special_price = 0;
      }
      product.currency = product.currency || (product._site && product._site.currency || 'usd')
    }

    function fixPricesInProductDetails(body) {
      fixPrices(body.product);
      _.each(body.subproducts, fixPrices);
    }

    return {
      browseNode : null,
      defaultDepartment: department,
      get: function(options) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var headers = angular.extend(options || {}, Auth.getIdentity());
          $http({
            url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.products,
            method: 'GET',
            headers: headers,
            api: true
          })
          .then(function(response) {
            deferred.resolve(response.data.hits);
          }, function(response) {
            deferred.reject(response.data);
          });

          return deferred.promise;
        });
      },

      universes: function() {
        return Auth.getCurrentUser()
        .then(function(){
        var deferred = $q.defer();
        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.universes,
          method: 'GET',
          headers: Auth.getIdentity(),
          api: true
        })
        .then(function(response) {
          deferred.resolve(response.data.body);
        }, function(reponse) {
          deferred.reject(response.data);
        });

        return deferred.promise;
        });
      },

      categories: function() {
        return Auth.getCurrentUser()
        .then(function(){
        var deferred = $q.defer();
        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.categories,
          method: 'GET',
          headers: Auth.getIdentity(),
          api: true
        })
        .then(function(response) {
          deferred.resolve(response.data.body);
        }, function(response) {
          deferred.reject(response.data);
        });

        return deferred.promise;
        });
      },

      setDepartment: function(dept) {
        department = dept;
      },

      getDepartment: function(){
        return department;
      },

      search: function(universe, query) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var url = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.products + '/' + universe;

          //clean query of empty objects (zalando fuss)
          var cleanQuery = _.omit(query, function(v){
            return _.isUndefined(v) || _.isNull(v) || v === '';
          });
        
          if(universe === 'zalando')
            _.forEach(cleanQuery, function(v, k){
              cleanQuery[k] = typeof(v) === 'string' && k === 'category' ? v.split('|') : v;
            })
        
          var headers = angular.extend(
            {
              'page': 1,
              'fetch-size': 30
            },
            cleanQuery,
            Auth.getIdentity()
          );

          $http({
            url: url,
            method: 'GET',
            headers: headers,
            api: true,
            ignore: 410
          })
          .then(function(response) {
            var data = response.data;
            if (data && data.body && data.body.products) {
              _.each(data.body.products, fixPrices);
              deferred.resolve({
                  page: data.body.meta,
                  products: data.body.products,
                  sortOptions: data.body.sort_options
              });
            }
            deferred.resolve({});
          }, function(response) {
            deferred.reject(response.data);
          });

          return deferred.promise;
        });
      },

      detail: function(sku) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var url = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.productDetail + '/' + sku;

          $http({
            url: url,
            method: 'GET',
            headers: Auth.getIdentity(),
            cache: true,
            api: true
          })
          .then(function(response) {
            var data = response.data;
            if (data && data.body && data.body.product) {
              fixPricesInProductDetails(data.body);
              deferred.resolve({
                  meta: data.body.subproducts,
                  product: data.body.product
              });
            } else if (_.get(data, 'status.error') === true) {
              deferred.reject(data);
            }
            deferred.resolve({});
          }, function(response) {
            deferred.reject(response.data);
          });

          return deferred.promise;
        });
      },

      filters: function(universe, query) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          filterUniverse = universe;

          var url = (SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.filters).replace(/{universe}/, universe);
          var headers = angular.extend(
            angular.fromJson(angular.toJson(query)),
            Auth.getIdentity()
          );

          tryGetFilters();

          function tryGetFilters()
          {
            $http({
              url: url,
              method: 'GET',
              headers: headers,
              api: true
            })
            .then(function(response) {
              var data = response.data;
              if (data && data.body) {
                data.body.query = query;
              //if(data.body.hasOwnProperty("Filters not available"))
              //  return $timeout(tryGetFilters, 100);
              deferred.resolve(data.body);              
              }
              deferred.reject({});
            }, function(response) {
              deferred.reject(response.data);
            });
          }

          return deferred.promise;
        });
      },

      download: function(universe, sku) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var url = (SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.productDownload).replace(/{universe}/, universe) + '/' + sku;

          $http({
            url: url,
            method: 'POST',
            headers: angular.extend({}, Auth.getIdentity(), {
              sku: sku,
              universe: universe
            }),
            api: true
          })
          .then(function(response) {
            var data = response.data;
            if (_.get(data, 'body.url')) {
              deferred.resolve(data.body.url);
            } else if (_.get(data, 'status.error') === true) {
              deferred.reject(data);
            }
            deferred.reject();
          },function(response) {
            deferred.reject(response.data);
          });

          return deferred.promise;
        });
       
      }
    };

  });


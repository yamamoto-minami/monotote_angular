'use strict';

angular.module('cmp.shoppable', [])
  .factory('Shoppable', function (Auth, $q, $http, SCT_CONFIG, Env) {
    var shoppableEndpoint = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.shoppables;
    return {

      // get a list of shoppables
      get: function(options) {
        var deferred = $q.defer();

        Auth.getCurrentUser()
        .then(function() {
            var headers = Auth.getIdentity();

            delete headers['user-hash']; // get items created by anyone (lately this param will be used to get items created by specific user, when anything move to the API)
            if(options.hasOwnProperty('item-hash')) {
              headers['item-hash'] = options['item-hash'];
            }
            else {
              headers['page'] = options.page;
              headers['user-hash'] = options.user || undefined;
              headers['page-records'] = options.records_per_page;
              headers['item-type'] = options.type || undefined;
              headers[options.sortBy === 'updated' ? 'date-order' : 'name-order'] = options.sortOrder;
              headers['item-status'] = options.status !== null ? options.status : undefined;
              headers['search-keyword'] = options.search || undefined;
            }
            $http({
              url: shoppableEndpoint,
              method: 'GET',
              headers: headers,
              api: true
            })
            .then(function(response) {
              var data = response.data;
              deferred.resolve(
                options.hasOwnProperty('item-hash') ? data.body.shoppable : data.body
              );
            }, function(response) {
              deferred.reject(response.data);
            });
        });

        return deferred.promise;
      },

      // save a shoppable
      save: function(data) {
        data = data || {};
        var deferred = $q.defer();
        var headers = angular.extend(
            Auth.getIdentity(),
            {
                type: data.type,
                'item-title': data.title,
                url: data.url || ''
            }
        );

        Auth.getCurrentUser()
        .then(function() {
            $http({
              url: shoppableEndpoint,
              method: 'POST',
              headers: headers,
              api: true
            })
            .then(function(response) {
              var data = response.data;
              if(data.status.error) {
                deferred.reject(data.status.text);
              }
              deferred.resolve(
                data.body
              );
            }, function(response) {
              deferred.reject(response.data);
            });
        });

        return deferred.promise;
      },

      // update a shoppable
      update: function(item_hash, data) {
        data = data || {};
        var deferred = $q.defer();

        Auth.getCurrentUser()
        .then(function() {
            $http({
              url: shoppableEndpoint,
              method: 'PUT',
              headers: angular.extend(
                Auth.getIdentity(), {
                  'item-hash': item_hash
                }
              ),
              data: data,
              api: true
            })
            .then(function(response) {
              deferred.resolve(
                response.data.body
              );
            }, function(response) {
              deferred.reject(response.data);
            });
        });

        return deferred.promise;
      },

      detectProducts: function(imageUrl) {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var url = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.detectProducts;

          return $http({
            url: url,
            method: 'POST',
            headers: angular.extend({}, Auth.getIdentity(), {
            }),
            data: {
              url: imageUrl
            },
            api: true
          })
          .then(function(response){
            if(response.data && response.data.status && response.data.status.code === 200) {
              return $q.resolve(response.data.body);
            }
            return $q.reject(response.data.status);
          });
        })
      },

      detectAvailability: function() {
        return Auth.getCurrentUser()
        .then(function(){
          var deferred = $q.defer();
          var url = SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.detectAvailability;

          return $http({
            url: url,
            method: 'GET',
            headers: angular.extend({}, Auth.getIdentity(), {
            }),
            api: true
          })
          .then(function(response){
            if(response.data && response.data.status && response.data.status.code === 200) {
              return $q.resolve(response.data.body);
            }
            return $q.reject(response.data.status);
          });
        })
      },

      // delete a shoppable
      delete: function(item_hash) {
        var deferred = $q.defer();

        Auth.getCurrentUser()
        .then(function() {
            $http({
              url: shoppableEndpoint,
              method: 'DELETE',
              headers: angular.extend(
                Auth.getIdentity(), {
                  'item-hash': item_hash
                }
              ),
              api: true
            })
            .then(function() {
                deferred.resolve();
            }, function(response) {
              deferred.reject(response.data);
            });
        });

        return deferred.promise;
      }

    };
  });

  
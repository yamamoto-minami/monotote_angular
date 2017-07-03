'use strict';

angular.module('cmp.order', [])
  .factory('Order', function ($http, SCT_CONFIG, Env, $q, Auth) {
    return {
      get: function(options) {
        var deferred = $q.defer();
        Auth.getCurrentUser()
        .then(function() {
          var headers = angular.extend(
            Auth.getIdentity(),
            options
          );
          $http({
              url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.orders,
              method: 'GET',
              headers: headers,
              api: true
            })
            .then(function (response) {
              var data = response.data;
              if(data.status.error){
                deferred.reject(data.status.text);
              }
              deferred.resolve(data);
            }, function (response) {
              deferred.reject(response.data);
            });
        });
        return deferred.promise;
      },
      download: function(url){
        var deferred = $q.defer();

        Auth.getCurrentUser()
        .then(function() {
          var headers = angular.extend(
            Auth.getIdentity(),
            {}
          );
          $http({
              url: url,
              method: 'GET',
              headers: headers,
              api: true
            }).then(function successCallback(response) {
                if(response.status.error){
                  deferred.reject(response.status.text);
                }
                deferred.resolve(response);
            }, function errorCallback(response) {
                deferred.reject(response);
            });
        });
        return deferred.promise;
      }
    };

  });


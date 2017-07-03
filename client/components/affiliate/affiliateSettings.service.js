'use strict';

angular.module('cmp.affiliate')
  .service('AffiliateSettingsService', function ($http, SCT_CONFIG, Env, $q, Auth) {

    var self = this;

    self.createKey = createKey;
    self.updateKey = updateKey;
    self.deleteKey = deleteKey;
    self.getSkeleton = getSkeleton;

    function createKey(company, siteId, key, value, encrypt) {
        var deferred = $q.defer();
        Auth.getCurrentUser()
        .then(function() {
            var headers = Auth.getIdentity();
            $http({
              url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliateSettings + '/' + company + '/' + siteId + '/' + key,
              method: 'POST',
              headers: headers,
              api: true,
              data: {
                value: value,
                encrypt: !!encrypt
              }
            })
            .then(function(res){
              res = res.data;
              if(res.status.code !== 200)
                deferred.reject(res);
              else
                deferred.resolve(res);
            }, function(err) {
              deferred.reject(err.data);
            });
        });
        return deferred.promise;
      }
      
      function updateKey(company, siteId, key, value, encrypt) {
        var deferred = $q.defer();
        Auth.getCurrentUser()
        .then(function() {
            var headers = Auth.getIdentity();
            $http({
              url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliateSettings + '/' + company + '/' + siteId + '/' + key,
              method: 'PUT',
              headers: headers,
              api: true,
              data: {
                value: value,
                encrypt: !!encrypt
              }
            })
            .then(function(res) {
              res = res.data;
              if(res.status.code !== 200)
                deferred.reject(res);
              else
                deferred.resolve(res);
            }, function(err) {
              deferred.reject(err.data);
            });
        });
        return deferred.promise;
      }

      function deleteKey(company, siteId, key) {
        return Auth.getCurrentUser()
        .then(function() {
          var headers = Auth.getIdentity();

          return $http({
            url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliateSettings + '/' + company + '/' + siteId + '/' + key,
            method: 'DELETE',
            headers: headers,
            api: true
          })
          .then(function(response){
            if(response.data.status.code !== 200)
              return $q.reject(response.data);
            return response.data;
          })
        });
      }

      function getSkeleton(options) {
        var deferred = $q.defer();
        Auth.getCurrentUser()
        .then(function() {
            var headers = angular.extend(options || {}, Auth.getIdentity());
            $http({
              url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliateSettings,
              method: 'GET',
              headers: headers,
              api: true
            })
            .then(function(res) {
              res = res.data;
              if (_.has(res, 'body')) {
                  deferred.resolve(res.body);
              } else {
                  deferred.reject();
              }
            }, function(err) {
              deferred.reject(err.data);
            });
        });
        return deferred.promise;
      }

  });


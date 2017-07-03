'use strict';

angular.module('cmp.publisher', [])
  .factory('Publisher', function ($http, SCT_CONFIG, Env, $q, $rootScope, $log, _) {

    return {

      profile: function() {

        var deferred = $q.defer();

        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.publisher,
          method: 'GET',
          api: true
        })
        .then(function(response) {
          var data = response.data;
          //redirect when error to login
          if(data.status.code!==200){
            $log.debug(data.status.text);
            deferred.reject(data.status);
            return deferred.promise;
          }
          var user = data.body.user;
          deferred.resolve({
            user: user,
            company: data.body.company,
            force: data.body.force,
            permissions: data.body.permissions,
            features: data.body.features
          });

          $rootScope.$broadcast('profile.update', {
            firstname: user.first_name,
            lastname: user.last_name,
            email: user.email,
            image: user.profile_img
          });

        }, function(response) {
          deferred.reject(response.data);
        });

        return deferred.promise;

      },

      update: function(profile) {

        var deferred = $q.defer();

        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.publisher,
          method: 'PUT',
          data: profile,
          headers: {
            'user-hash': profile.user.user_hash,
            'api-key': profile.company.api_key
          },
          api: true
        })
        .then(function(response) {
          var data = response.data;
          deferred[_.get(data, 'status.code') === 200 ? 'resolve' : 'reject']({ status: data.status, body: data.body });
        }, function(response) {
          deferred.reject(response.data);
        });

        return deferred.promise;

      },

      changePassword: function(userHash, oldPassword, newPassword) {
        return $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.accountChangePassword,
          method: 'PUT',
          headers: {
            'user-hash': userHash,
            'old-password': oldPassword,
            'new-password': newPassword
          },
          api: true
        })
        .then(function(response){
          if(_.get(response.data, 'status.code') !== 200)
            return $q.reject(response.data.status);
          return response.data.status;
        });
      },

      confirmation: function(token, email, password) {

        var deferred = $q.defer();

        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.publisherConfirmation,
          method: 'PUT',
          headers: { 
            'token': token,
            'email': email,
            'password': password
          },
          api: false
        })
        .then(function(response) {
          deferred.resolve(response.data);
        }, function(response) {
          deferred.reject(response.data);
        });

        return deferred.promise;

      }

    };

  });


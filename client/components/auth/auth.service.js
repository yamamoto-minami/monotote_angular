'use strict';

angular.module('cmp.auth', ['cmp.mixpanelClient'])
  .factory('Auth', function Auth($location, $rootScope, $http, $log, Publisher, $cookieStore, $q, SCT_CONFIG, Env, $state, $window, MixpanelClientService, _) {

    var currentUser = {};

    $rootScope.$on('user.unset', function(){
      currentUser = {};
    });

    if($cookieStore.get('ac')) {
      currentUser = Publisher.profile()
      .then(function(data) {
        $log.debug('profile response',data);
        //if ($state.current.name === 'login') {
        //    if ($rootScope.routerPrevState && $rootScope.routerPrevState.name) {
        //      $state.go($rootScope.routerPrevState);
        //    } else {
        //      $state.go(SCT_CONFIG.defaultRoute);
        //    }
        //}
        $rootScope.$broadcast('user.set');
        currentUser = data;
        MixpanelClientService.setUserHash(currentUser.user.user_hash);
        configPlayerPlugin(data);
      });

    }

    // configure the monotote player plugin
    function configPlayerPlugin(config) {
        $window._mnt = {
            publisherKey: config.company.api_key,
            loadFeed: true
        };
    }

    function authorizeUser(accessToken) {
      $cookieStore.put('ac', accessToken);
      return currentUser = Publisher.profile()
      .then(function(res) {
        currentUser = res;
        currentUser.api_key = currentUser.company.api_key;
        MixpanelClientService.setUserHash(currentUser.user.user_hash);
        MixpanelClientService.track('App: login');
        configPlayerPlugin(res);
      });
    }

    return {

      authorize: authorizeUser,

      login: function(user, callback) {

        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var self = this;

        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.oauth,
          method: 'POST',
          data: {
            'grant_type': 'password',
            'client_id': SCT_CONFIG.environments[Env].oauth_client_id,
            'client_secret': SCT_CONFIG.environments[Env].oauth_client_secret,
            'username': user.email,
            'password': user.password
          }
        })
        .then(function(response) {
          var data = response.data; 
          if(data.status && data.status.error){
            self.logout();
            deferred.reject(data.status);
            return cb(data.status);
          }
          authorizeUser(data.access_token)
          .then(function(){
            deferred.resolve(currentUser);
            cb();
          });
        }, function(response) {
          var err = response.data;
          $log.debug('login err',err);
          self.logout();
          deferred.reject(err);
          return cb(err);
        });

        return deferred.promise;
      },

      logout: function() {
        $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.oauth,
          method: 'DELETE',
          api: true
        }).finally(function() {
          $cookieStore.remove('ac');
          MixpanelClientService.track('App: logout');
          MixpanelClientService.setUserHash(null);
          $rootScope.$broadcast('user.unset');
          if ($state.current.name !== 'login') {
              $state.go('login');
          }
        });
      },
      
      requestForgotPasswordLink: function(email, resetInterfaceUrl) {
        return $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.passwordReset,
          method: 'POST',
          headers: {
            'email': email,
            'reset-interface-url': resetInterfaceUrl
          }
        })
        .then(function(response){
          if(response.data.status.code !== 200)
            return $q.reject(response.data.status);
        });
      },
      /*
      requestConfirmationLink: function(email, userHash, confirmationInterfaceUrl) {
        return $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.publisherConfirmation,
          method: 'POST',
          headers: {
            'email': email,
            'user-hash': userHash,
            'confirm-interface-url': confirmationInterfaceUrl
          }
        })
        .then(function(response){
          if(response.data.status.code !== 200)
            return $q.reject(response.data.status);
        });
      },
      */
      resetForgottenPassword: function(forgotToken, newPassword) {
        return $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.passwordReset,
          method: 'PUT',
          headers: {
            'forgot-token': forgotToken,
            'password': newPassword
          }
        })
        .then(function(response){
          if(response.data.status.code !== 200)
            return $q.reject(response.data.status);
        });
      },
      
      createUser: function(data, referral) {
        return $q.resolve()
        .then(function(){
          if(!referral) return;
          var affiliate_id = _.get(data, 'keys.affiliate_id') || 'null';
          return $http({
            url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.publisherValidateId.replace(/{affiliate}/, referral),
            method: 'POST',
            data: {value: affiliate_id}
          })
          .then(function(response){
            if(response.data.status.code !== 200)
            {
              response.data.status.errors = response.data.body;
              return $q.reject(response.data.status);
            }
          })
        })
        .then(function(){
          return $http({
            url: SCT_CONFIG.environments[Env].apiUrl + (referral ? SCT_CONFIG.route.publisherConnect + '/' + encodeURIComponent(referral) : SCT_CONFIG.route.publisher),
            method: 'POST',
            data: angular.fromJson(angular.toJson(data)) // don't send angular specific objects
          })
        })
        .then(function(response){
          if(response.data.status.code !== 200)
          {
            response.data.status.errors = response.data.body;
            return $q.reject(response.data.status);
          }
          return response.data.body;
        });
      },

      getCurrentUser: function() {
        var deferred = $q.defer();

        if(currentUser.hasOwnProperty('$$state')) {
            currentUser.then(function() {
                deferred.resolve(currentUser);
            });
        } else {
            if(!currentUser.user) deferred.reject();
            deferred.resolve(currentUser);
        }

        return deferred.promise;
      },

      getFeatures: function() {
        return currentUser.hasOwnProperty('user') ? currentUser.features : []
      },

      getFeaturesObj: function(mergeWithPermissions) {
        var self = this;
        var obj = {};
        self.getFeatures().forEach(function(feature){
          obj[feature] = true;
        });

        if(mergeWithPermissions) {
          var permissions = self.getPermissions();
          _.keys(permissions).forEach(function(permission){
            obj[permissions] = permissions[permission];
          })
        }

        return obj;
      },

      getPermissions: function() {
        return currentUser.hasOwnProperty('user') ? currentUser.permissions : {}
      },

      getIdentity: function() {
        return currentUser.hasOwnProperty('user') ? {
          'user-hash': currentUser.user.user_hash,
          'api-key': currentUser.company.api_key
        } : {};
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$$state')) {
          currentUser.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('user')) {
          cb(true);
        } else {
          cb(false);
        }
      }

    };
  });

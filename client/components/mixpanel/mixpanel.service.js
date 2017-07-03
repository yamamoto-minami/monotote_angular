'use strict';

angular.module('cmp.mixpanel', ['cmp.lodash', 'cmp.base64'])
.service('Mixpanel', ['$q', '$http', 'SCT_CONFIG', 'Auth', 'Env', 'Base64Factory',
    function($q, $http, SCT_CONFIG, Auth, Env, Base64Factory) {
      // options = {
      //  'unit': 'day'
      //  'interval': int // from today - unit * days
      // }
      //
      // options = {
      //  'unit': 'day'
      //  'to_date':'2015-03-03',
      //  'from_date':'2015-02-02'
      // }

      var pubKey,
          apiKey = SCT_CONFIG.environments[Env].mixpanel_api_key,
          apiUrl = SCT_CONFIG.mixpanel_base_url,
          config = SCT_CONFIG.environments[Env],
          authHeaders = {
            'Authorization': 'Basic ' + Base64Factory.encode(apiKey)
          };

      var serializeParams = function(params) {
          params = _.extend({}, params);
          for (var key in params) {
              if (params.hasOwnProperty(key) && params[key] && _.isArray(params[key])) {
                  params[key] = JSON.stringify(params[key]);
              }
          }
          return params;
      };

      this.getRevenueData = function(options, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var request, params;

        Auth.getCurrentUser()
        .then(function(ident){
          pubKey = ident.company.api_key; //'123-hash';

          // lets not mess up anything else
          options = angular.copy(options);
          options.unit = 'month';
          delete options.type;

          request = {
            url: apiUrl + 'engage/revenue/'
          };

          if (!options.unit) {
            deferred.reject(new Error('Request parameter failure: no unit'));
            return deferred.promise;
          }
          //
          params = serializeParams(_.defaults({}, options, {
            'action': 'properties["$product_name"]',
            'selector': '(properties["publisher_key"] == "'+pubKey+'")'
          }));

            $http({
              method: 'GET',
              url: request.url,
              params: params,
              headers: authHeaders
            }).then(function successCallback(response) {
              deferred.resolve(response.data);
              return cb(response.data);
            }, function errorCallback(response) {
              deferred.reject(response);
              return cb(response);
            });
        });

        return deferred.promise;
      };

      this.getEventData = function(options, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var request, params;

        request = {
          url: apiUrl + 'events/'
        };

        Auth.getCurrentUser()
        .then(function(ident){
          pubKey = ident.company.api_key; //'123-hash';

          if (!options.event) {
            deferred.reject(new Error('Request parameter failure: no event names'));
            return deferred.promise;
          }

          // @TODO use angularjs.extend instead of lodash
          params = serializeParams(_.defaults({}, options, {
            'where': '(string(properties["publisher_key"]) == "'+pubKey+'")',
            'type': 'general'
          }));
          

            $http({
              method: 'GET',
              url: request.url,
              params: params,
              headers: authHeaders
            }).then(function(data) {
              //if (textStatus === 'success') {
                  deferred.resolve(data);
              //} else {
              //    deferred.reject(new Error('Mixpanel API failure: ' + textStatus));
              //}
                return cb(data);
            }, function(err) {
              deferred.reject(err);
              return cb(err);
            });

        });

        return deferred.promise;

      };

      this.getEventNames = function(callback) {

        var cb = callback || angular.noop;
        var deferred = $q.defer();
        var request, params;

        request = {
          url: apiUrl + 'events/names/'
        };

        params = {
          'type': 'general'
        };

          $http({
            method: 'GET',
            url: request.url,
            params: params,
            headers: authHeaders
          })
          .then( function(data) {
            deferred.resolve(data);
            return cb(data);
          }, function (err) {
            deferred.reject(err);
            return cb(err);
          });


        return deferred.promise;
      };
    }

]);


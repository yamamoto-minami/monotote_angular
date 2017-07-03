(function(){
  "use strict";

  angular
  .module('cmp.retailer', [])
  .service('RetailerService', RetailerService)

  RetailerService.$inject = ['$q', '$http', 'SCT_CONFIG', 'Env', 'Auth'];
  function RetailerService($q, $http, SCT_CONFIG, Env, Auth){
    var self = this;

    self.getAvailableRetailers = getAvailableRetailers;


    function getAvailableRetailers(){
      return $q.resolve()
      .then(function(){
        return Auth.getCurrentUser()
      })
      .then(function(){
        return $http({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.getAvailableRetailers,
          method: 'GET',
          headers: Auth.getIdentity(),
          api: true
        })
      })
      .then(function(response){
        if(response.data && response.data.status && response.data.status.code === 200) {
          return $q.resolve(response.data.body);
        }
        return $q.reject(response.data.status);
      })
    }

  }

})();
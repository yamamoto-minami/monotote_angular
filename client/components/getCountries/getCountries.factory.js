(function(){
    "use strict";

    angular
    .module('cmp.getCountries', [])
    .factory('GetCountriesFactory', GetCountriesFactory);

    GetCountriesFactory.$inject = ['$http', 'Env', 'SCT_CONFIG'];
    function GetCountriesFactory($http, Env, SCT_CONFIG){
        return $http.get(SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.getCountries)
        .then(function(response){
            return response.data.body;
        });
    }
})();
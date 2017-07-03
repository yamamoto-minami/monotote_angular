(function(){
    "use strict";

    angular
    .module('cmp.affiliate')
    .service('AffiliateService', AffiliateService);

    AffiliateService.$inject = ['$http', '$timeout', 'SCT_CONFIG', 'Env', '$q', '_', 'Auth'];
    function AffiliateService($http, $timeout, SCT_CONFIG, Env, $q, _, Auth)
    {
        var self = this;
        self.getProductAffiliateLink = getProductAffiliateLink;
        self.getAffiliate = getAffiliate;

        function getProductAffiliateLink(sku)
        {
            var headers = angular.extend({}, Auth.getIdentity());
            return $http({
                url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliate_link + '/' + encodeURIComponent(sku),
                method: 'GET',
                headers: headers,
                api: true
            })
            .then(function(response){
                var statusCode = _.get(response.data, 'status.code');
                if(statusCode !== 200)
                    return $q.reject(_.get(response.data, 'status'));
                return _.get(response.data, 'body.affiliate_link') || null;
            });
        }

        function getAffiliate(affiliate)
        {
            return $http({
                url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.affiliate + '/' + encodeURIComponent(affiliate),
                method: 'GET',
                params: {
                    'api-key': '123-hash'
                },
                api:true
            })
            .then(function(response){
                var statusCode = _.get(response.data, 'status.code');
                if(statusCode !== 200)
                    return $q.reject(_.get(response.data, 'status'));
                return response.data.body;
            })
        }

    }

})();
(function(){
    "use strict";

    angular.module('cmp.mixpanelClient', [])
    .service('MixpanelClientService', MixpanelClientService);

    MixpanelClientService.$inject=['$q','$window','$location','SCT_CONFIG', 'Env'];
    function MixpanelClientService($q, $window,$location,SCT_CONFIG,Env){

        var userHash = null;
        mixpanel.init(SCT_CONFIG.environments[Env].mixpanel_token);
        mixpanel.set_config({
            cross_subdomain_cookie: false,
            store_google: false,
            track_pageview: false
        });

        this.setUserHash = function(hash){
            userHash = hash;
        };

        this.track = function(name, properties){
            if(!userHash) {
                return;
            }
            return $q.resolve(mixpanel.track(name, angular.extend({
                language: 'en',
                url: $location.url(),
                user_id: userHash
            }, properties || {})))
        };
    }
})();
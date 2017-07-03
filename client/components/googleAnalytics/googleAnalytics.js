(function(){
    'use strict';

    angular
    .module('cmp.googleAnalytics', [])
    .factory('GoogleAnalyticsObjectFactory', GoogleAnalyticsObjectFactory)
    .service('GoogleAnalyticsService', GoogleAnalyticsService)

    GoogleAnalyticsObjectFactory.$inject = ['$q', '$window'];
    function GoogleAnalyticsObjectFactory($q, $window) {
        return $q(function(resolve){
            if($window.ga) return resolve($window.ga);
            var timer = $window.setInterval(function(){
                if($window.ga) {
                    $window.clearInterval(timer);
                    resolve($window.ga);
                }
            }, 1000);
        })
    }

    GoogleAnalyticsService.$inject = ['GoogleAnalyticsObjectFactory']
    function GoogleAnalyticsService(GoogleAnalyticsObjectFactory) {
        this.createEvent = createEvent;
        this.setDimension = setDimension;

        function createEvent(event){
            return GoogleAnalyticsObjectFactory
            .then(function(ga){
                ga('send', angular.extend({
                    hitType: 'event'
                }, event));
            })
        }

        function setDimension(name, value) {
            return GoogleAnalyticsObjectFactory
            .then(function(ga){
                ga('set', name, value);
            })
        }
    }
})();
    (function(){
    "use strict";

    angular
    .module('cmp.pluginJack', [])
    .service('PluginJackService', PluginJackService);

    PluginJackService.$inject = ['$q', '$timeout', '$window', '$log', 'Auth']
    function PluginJackService($q, $timeout, $window, $log, Auth) {

        var self = this;

        self.testPluginConnection = testPluginConnection;

        function jsonParseSafe(json, length) {
            try {
                if(json.length > (length != null ? length : 1024)) return {};
                return angular.fromJson(json);
            } catch(e) {
                return {};
            }
        }

        function testPluginConnection(url){
            url = url.trim();
            return $q.resolve()
            .then(function(){
                if(/^http\:\/\//i.test(url) === false) { return; }
                if($window.location.protocol === 'http:') { return; }
                return $q.reject('https-error');
            })
            .then(function(){
                return $q(function(connectSuccess, connectFail){
                    var iframe = angular.element('<iframe width="0" height="0" mnt-processed="true" sandbox="allow-forms allow-scripts allow-same-origin" style="position:absolute; overflow: hidden" />').appendTo('body');
                    angular.element($window).on('message', checkMessage);

                    $timeout(function(){
                        reject();
                    }, 10000);

                    iframe.attr('src', url);

                    iframe.on('error', function(){
                        reject();
                    })

                    function checkMessage(event){
                        var origin = event.origin || event.originalEvent.origin;
                        if (url.indexOf(origin) !== 0)
                            return;
                        var data = jsonParseSafe(event.data || event.originalEvent.data);
                        if(data.mnt_message === 'monotote-plugin-feed' && data.publisher_key === Auth.getIdentity()['api-key']) {
                            connectSuccess();
                            angular.element($window).off('message', checkMessage);
                            iframe.remove();
                        }
                    }

                    function reject(){
                        angular.element($window).off('message', checkMessage);
                        iframe.remove();
                        connectFail();
                    }
                })
            })
            
        }

    }
})();
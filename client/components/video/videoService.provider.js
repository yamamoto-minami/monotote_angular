(function(){
    "use strict";

    angular
    .module('cmp.video', [])
    .provider('videoService', VideoServiceProvider);

    function VideoServiceProvider()
    {
        var provider = this;

        provider.registeredVideoProviders = {};
        provider.registerVideoProvider = registerVideoProvider;
        provider.$get = VideoFactory;

        function registerVideoProvider(key, value)
        {
            provider.registeredVideoProviders[key] = value;
        }

        VideoFactory.$inject = ['_','$log'];
        function VideoFactory(_,$log)
        {
            var self = {
                total: 0,
                progress: 0,
                current: 0,
                formatTime: formatTime,
                setCurrentTime: setCurrentTime,
                detectProvider: detectProvider
            };

            var providers = _.keys(provider.registeredVideoProviders)
            .map(function(x){
                return provider.registeredVideoProviders[x];
            });

            function detectProvider(url)
            {
                var detected = _.find(providers, function(x){
                    return x.regexp.test(url);
                });
                $log.debug('detected provider from url:', url, detected);
                return detected;
            }

            function formatTime(seconds){
                var min = Math.floor(seconds / 60);
                var sec = Math.round(seconds % 60);
                return (min < 10? '0' + min : min) + ':' + (sec < 10? '0' + sec : sec);
            }

            function setCurrentTime(seconds) {
                if (this.provider && this.provider.setCurrentTime) {
                    this.provider.setCurrentTime(seconds);
                }
            }

            return self;
        }
    } 
})();

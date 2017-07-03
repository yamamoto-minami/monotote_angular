(function(){
    "use strict";

    angular
    .module('app.generatelink', ['cmp.base64'])
    .config(GenerateLinkConfig);

    GenerateLinkConfig.$inject = ['$stateProvider'];
    function GenerateLinkConfig($stateProvider)
    {
        $stateProvider.state('generatelink', {
            url: '/generate-link',
            templateUrl: 'app/generatelink/generatelink.html',
            controller: 'GenerateLinkController',
            authenticate: true,
            supportLink: 'https://support.monotote.com/hc/en-us/articles/213632409'
        });
    }
})();
(function(){
    'use strict';
    
    angular
    .module('cmp.translations', ['ui.router', 'pascalprecht.translate'])
    .factory('multiLangLoader', MultiLangLoaderFactory)
    .factory('multiLangErrorHanlder', TranslationErrorHandlerFactory)
    .config(TranslationConfig)
    .run(TranslationUpdate);
    
    TranslationConfig.$inject = ['$translateProvider'];
    function TranslationConfig($translateProvider)
    {
        $translateProvider.useLoader('multiLangLoader');
        $translateProvider.useSanitizeValueStrategy('escape');
        $translateProvider.useMissingTranslationHandler('multiLangErrorHanlder');
        $translateProvider.preferredLanguage('en');
    }
    
    MultiLangLoaderFactory.$inject = ['$q', '$state', '$log', '$http', 'SCT_CONFIG', 'Env'];
    function MultiLangLoaderFactory($q, $state, $log, $http, SCT_CONFIG, Env) {
        return function (options) {
            $log.debug('loading language', options.key);
            return $http({
                url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.translations + '/' + options.key + '?api-key='+SCT_CONFIG.environments[Env].public_api_key,
                method: 'GET'
            })
            .then(function(response){
                response = response.data;
                if(response && response.status && response.status.code === 200 && response.body && response.body.translations){
                    return $q.resolve(response.body.translations);
                }
                return $q.reject(options.key);
            });
        };
    }

    function TranslationErrorHandlerFactory()
    {
        return function (translationID, uses) {
            return translationID; // simply display a key
        };
    }
    
    TranslationUpdate.$inject = ['$rootScope', '$state', '$translate', '$log']
    function TranslationUpdate($rootScope, $state, $translate, $log)
    {
        $rootScope.$on('$translateChangeSuccess', function ($event, result) {
            $rootScope.hasTranslations = result.language;
            $log.debug('localization was successfully changed to', result.language);
        });
    }
})();
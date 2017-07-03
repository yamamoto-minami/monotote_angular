(function(){
    'use strict';
    
    angular
    .module('app.reset-forgotten-password', ['ui.router','app.login'])
    .config(PasswordResetModuleConfiguration);
    
    PasswordResetModuleConfiguration.$inject = ['$stateProvider'];
    function PasswordResetModuleConfiguration($stateProvider)
    {
        $stateProvider
        .state('passwordReset', {
            url: '/password-reset',
            controller: 'PasswordResetController',
        })
        .state('passwordResetLinkDeprecated', {
            url: '/password-reset/:forgotToken',
            controller: 'PasswordResetController',
        })
        .state('passwordResetLink', {
            url: '/password-reset/:email/:forgotToken',
            controller: 'PasswordResetController',
        });
    }
})();
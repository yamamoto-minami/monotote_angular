(function(){
    'use strict';
    
    angular
    .module('app.signup', ['ui.router','app.login','cmp.setFocus','cmp.googleAnalytics'])
    .config(SignupModuleConfiguration);
    
    SignupModuleConfiguration.$inject = ['$stateProvider'];
    function SignupModuleConfiguration($stateProvider)
    {
        $stateProvider
        .state('signup', {
            url: '/signup/:ref',
            controller: 'SignupController',
            params: {
                ref: 'awin'
            }
        })
        .state('signupRef', {
            url: '/signup?ref',
            controller: function($state){
                $state.go('signup', {}, {replace:true});
            },
        })
        .state('signupSuccess', {
            url: '/signup-success',
            controller: 'SignupController',
            params: {
                valid: false
            }
        });
    }
})();
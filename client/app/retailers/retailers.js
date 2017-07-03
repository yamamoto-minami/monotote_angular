(function(){
    'use strict';
    
    angular
    .module('app.retailers', ['ui.router','cmp.retailer'])
    .config(RetailersModuleConfiguration);
    
    RetailersModuleConfiguration.$inject = ['$stateProvider'];
    function RetailersModuleConfiguration($stateProvider)
    {
        $stateProvider
        .state('availableRetailers', {
            url: '/retailers/list',
            controller: 'RetailersListController',
            templateUrl: 'app/retailers/retailers-list.html',
            authenticate: true
        });
    }
})();

(function(){
    'use strict';
    
    angular
    .module('app.retailers')
    .controller('RetailersListController', RetailersListController)

    RetailersListController.$inject = ['$scope', 'RetailerService'];
    function RetailersListController($scope, RetailerService){
        $scope.loading = true;
        $scope.activeRetailers = [];

      RetailerService.getAvailableRetailers()
        .then(function(retailers){
            $scope.retailers = retailers;
            $scope.loading = false;
            $scope.activeRetailers = retailers.connected;
        });

        $scope.getDomain = function (url) {
            if(url.indexOf('https://') > -1) {
                return url.split("https://")[1];
            } else {
                return url.split("http://")[1];
            }
        };
    }
})();

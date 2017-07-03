(function(){
    "use strict";

    angular
    .module('app.tour', [])
    .controller('AppTourController', AppTourController);
    
    AppTourController.$inject = ['$scope', '$state', '$timeout', 'Auth', 'SCT_CONFIG'];
    function AppTourController($scope, $state, $timeout, Auth, SCT_CONFIG)
    {
        var self = this;
        self.startTour = startTour;
        self.closeTour = closeTour;
        self.generateTourStep = generateTourStep;
        self.$state = $state;

        var tourStep = 0;
        self.runningTour = false;
        self.disabled = true;

        var isLoggedIn = false;

        $scope.$on('user.set', function(){
            isLoggedIn = true;
            Auth.getCurrentUser()
            .then(function(data){
                if($scope.appDashboardReady) self.disabled = false;
                else {
                    var off = $scope.$on('app.dashboard.ready', function(){
                        off();
                        data.force['tutorial-mode'] && $timeout(function(){
                            isLoggedIn && self.startTour(1);
                        },500);
                        self.disabled = false;
                    })
                }
            })
        })
        

        $scope.$on('user.unset', function(){
            isLoggedIn = false;
            self.closeTour();
        })

        function startTour(startFromStep)
        {
            if(self.disabled) return;
            self.runningTour = true;
            self.startFromStep = startFromStep || 0;
            if(self.ctrl){
                self.ctrl.unselectAllSteps();
                self.ctrl.select(self.startFromStep);
            }
        }

        function closeTour()
        {
            if(!self.runningTour) return;
            self.runningTour = false;
            self.ctrl && self.ctrl.cancelTour();
        }

        function generateTourStep()
        {
            return tourStep++;
        }
    }
})();
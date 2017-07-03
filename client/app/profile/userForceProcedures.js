(function(){
    "use strict";

    angular
    .module('app.profile')
    .run(UserForceProceduresSetup);

    UserForceProceduresSetup.$inject = ['$rootScope', '$state', '$timeout', 'Auth', 'SCT_CONFIG'];
    function UserForceProceduresSetup($rootScope, $state, $timeout, Auth, SCT_CONFIG)
    {
        var loggedIn = false;

        $rootScope.$on('user.set', function(){
            loggedIn = true;
            Auth.getCurrentUser()
            .then(executeForceProcedures);
        });

        $rootScope.$on('user.unset', function(){
            loggedIn = false;
        })

        $rootScope.$on('user.password.set', function(event, mode){
            mode==='broadcast' || $rootScope.$broadcast('user.password.set', "broadcast");
        });

        function executeForceProcedures(data) {
            var turnOffPreventingRedirection, turnOffForceProcedureCheck, turnOffUserCheck;

            if(!data.force) return;

            var forceRedirect = [];

            if(data.force['password-reset']) {
                forceRedirect.push({
                    state: 'changePassword',
                    params: null,
                    successEvent: 'user.password.set',
                    preventRouteChange: true
                });
            }
            if(data.force['setup-affiliate']) {
                forceRedirect.push({
                    state: 'affiliates',
                    params: {
                        company: data.force['setup-affiliate']
                    },
                    successEvent: 'user.affiliates.set',
                    preventRouteChange: false
                })
            }

            var totalTasks = forceRedirect.length;

            lockRouter();

            function lockRouter(){
                if(forceRedirect.length === 0) {
                    disableEventHandling();
                    $rootScope.appDashboardReady = true;
                    $rootScope.$broadcast('app.dashboard.ready');
                    totalTasks && $state.go(SCT_CONFIG.defaultRoute, null, {replace:true});
                    return;
                }
                var route = forceRedirect.shift();
                $state.go(route.state, route.params, {replace:true})
                .then(function(){
                    turnOffPreventingRedirection = $rootScope.$on('$stateChangeStart', function(event){
                        if(route.preventRouteChange) {
                            event.preventDefault();
                        }
                        else if (loggedIn) {
                            forceRedirect = [];
                            lockRouter();
                        }
                    });
                    turnOffForceProcedureCheck = $rootScope.$on(route.successEvent, onForceProcedureDone);
                    turnOffUserCheck = $rootScope.$on('user.unset', disableEventHandling);
                });
            }
            

            function onForceProcedureDone(){
                disableEventHandling();
                lockRouter();
            }
            
            function disableEventHandling(){
                turnOffPreventingRedirection = turnOffPreventingRedirection && turnOffPreventingRedirection();
                turnOffForceProcedureCheck = turnOffForceProcedureCheck && turnOffForceProcedureCheck();
                turnOffUserCheck = turnOffUserCheck && turnOffUserCheck();
            }
        }
    }
})();
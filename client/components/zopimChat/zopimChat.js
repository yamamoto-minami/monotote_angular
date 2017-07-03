(function(){
    "use strict";

    angular
    .module('cmp.zopimChat', [])
    .run(ZopimChatSetup);

    ZopimChatSetup.$inject = ['$rootScope', '$window', 'Auth'];
    function ZopimChatSetup($rootScope, $window, Auth) {
        $rootScope.$on('user.set', function(){
            Auth.getCurrentUser()
            .then(function(data){
                $window.$zopim(function(){
                    $window.$zopim.livechat.set({
                        name: [data.user.first_name, data.user.last_name].join(' '),
                        email: data.user.email,
                        phone: data.user.phone||''
                    })
                })
            })
        })

        $rootScope.$on('user.unset', function(){
            $window.$zopim(function(){
                $window.$zopim.livechat.clearAll();
            })
        })
    }
})();
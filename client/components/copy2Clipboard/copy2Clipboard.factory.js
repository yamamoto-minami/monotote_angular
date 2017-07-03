(function(){
    "use strict";

    angular
    .module('cmp.copy2clipboard', [])
    .factory('Copy2ClipboardFactory', Copy2ClipboardFactory);
    
    Copy2ClipboardFactory.$inject = ['$q', '$window'];
    function Copy2ClipboardFactory($q, $window)
    {
        var self = copy2Clipboard;

        function copy2Clipboard(text)
        {
            return $q.resolve()
            .then(function(){
                var textarea = angular.element('<textarea/>');
                return $q.resolve()
                .then(function(){
                    textarea
                    .css({
                        position: 'fixed',
                        opacity: 0
                    })
                    .val(text)
                    .appendTo($window.document.body);
                    textarea[0].select();

                    if(!document.execCommand("copy"))
                        return $q.reject();
                })
                .then(cleanup, function(){
                    cleanup();
                    return $q.reject();
                })

                function cleanup()
                {
                    textarea.remove();
                }
            })
            .then(function(){
                return true;
            }, function(err){
                if(err)
                    return $q.reject(err);
                
                $window.prompt("Hit \"copy to clipboard\" on your keyboard and press \"Enter\"", text);
                return false;
            })
        }

        return self;
    }

})();
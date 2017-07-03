(function(){
    "use strict";
    
    angular
    .module('cmp.watch', [])
    .directive('watch', WatchDirective);
    
    function WatchDirective()
    {
        var config = {
            restrict: 'A',
            link: link
        };
        
        function link(scope, element, attrs)
        {
            var watcher = scope.$watch(attrs.watch, function(val){
                if(attrs.watchChange != null)
                {
                    scope.$eval(attrs.watchChange, {
                        $value: val
                    });
                }
            });
        }

        return config;
    }
})();

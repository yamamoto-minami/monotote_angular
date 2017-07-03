(function(){
    "use strict";
    
    angular
    .module('cmp.removeFocus', [])
    .directive('removeFocus', RemoveFocusDirective);
    
    function RemoveFocusDirective()
    {
        var config = {
            restrict: 'A',
            link: link
        };
        
        function link(scope, element, attrs)
        {
            element.on(attrs.removeFocus || 'click', activate);
            
            scope.$on('$destroy', function(){
                element.off(attrs.removeFocus || 'click', activate);
            });
            
            function activate($event)
            {
                element[0].blur();
            }
        }
        
        return config;
    }
})();

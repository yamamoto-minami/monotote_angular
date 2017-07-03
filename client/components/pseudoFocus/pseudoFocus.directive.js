(function(){
    "use strict";
    
    angular
    .module('cmp.pseudoFocus', [])
    .directive('pseudoFocus', PseudoFocusDirective);
    
    PseudoFocusDirective.$inject = ['$window','$timeout'];
    function PseudoFocusDirective($window,$timeout)
    {
        var config = {
            link: link,
            restrict: 'A'
        };
        
        function link(scope, element, attrs)
        {
            scope.$watch(attrs.pseudoFocus, function(val){
                if(val)
                    $timeout(function(){
                        angular.element($window).on('click', onClick);
                    });
                else
                    angular.element($window).off('click', onClick);
            });
            
            scope.$on('$destroy', function(){
                angular.element($window).off('click', onClick);
            });
            
            function onClick($event)
            {
                attrs.onPseudoBlur && scope.$eval(attrs.onPseudoBlur, {
                    $event: $event
                });
                
                scope.$apply();
            }
        }
        
        return config;
    }
    
})();
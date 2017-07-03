(function(){
    "use strict";

    angular
    .module('cmp.setFocus', [])
    .directive('setFocus', FocusOnInputFieldDirective);

    FocusOnInputFieldDirective.$inject = ['$window'];
    function FocusOnInputFieldDirective($window)
    {
        var config = {
            link: link
        };

        function link(scope, element, attrs)
        {
            scope.$watch(attrs.setFocus, check);
            
            function check(val)
            {
                if(val) {
                    element.add(element.find('*')).focus();
                }
            }
        }

        return config;
    }
})();
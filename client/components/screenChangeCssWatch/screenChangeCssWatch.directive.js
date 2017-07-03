(function(){
    "use strict";

    angular
    .module('cmp.screen-change-css-watch', [])
    .directive('screenWatch', ScreenWatchDirective);

    ScreenWatchDirective.$inject = ['$window','$timeout'];
    function ScreenWatchDirective($window,$timeout)
    {
        var config = {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs)
        {
            var currentValue = null;

            angular.element($window).on('resize', onScreenChange);
            scope.$on('$destroy', function screenWatchDestroy(){
                angular.element($window).off('resize', onScreenChange);
            })

            attrs.hasOwnProperty('screenWatchInit') && $timeout(function screenWatchInitTimeout(){
                currentValue = getCssValue();
                triggerUpdate();
            })

            function onScreenChange(){
                scope.$apply(function(){
                    var newValue = getCssValue();
                    if(newValue !== currentValue){
                        currentValue = newValue;
                        triggerUpdate();
                    }
                })
            }

            function getCssValue(){
                return $window.getComputedStyle(element[0])[attrs.screenWatch];
            }

            function triggerUpdate(){
                if(attrs.screenWatchChange != null)
                {
                    scope.$eval(attrs.screenWatchChange, {
                        $value: currentValue
                    });
                }
            }
        }

        return config;
    }
})();

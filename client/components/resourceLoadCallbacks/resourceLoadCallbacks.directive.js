(function(){
    "use strict";

    angular
    .module('cmp.resourceLoadCallbacks',[])
    .directive('resourceLoadCallbackError', ResourceLoadCallbackErrorDirective);

    function ResourceLoadCallbackErrorDirective()
    {
        var config = {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs){
            element.on('load', onLoad);
            element.on('canplay', onLoad);
            element.on('error', onError);

            scope.$on('$destroy', function(){
                element.off('load', onLoad);
                element.off('canplay', onLoad);
                element.off('error', onError);
            })

            function onError(){
                if(attrs.resourceLoadCallbackError) {
                    scope.$apply(function(){
                        scope.$eval(attrs.resourceLoadCallbackError);
                    })
                }
            }

            function onLoad(){
                if(attrs.resourceLoadCallbackSuccess) {
                    var resource = this;
                    scope.$apply(function(){
                        scope.$eval(attrs.resourceLoadCallbackSuccess, {$width:resource.width, $height: resource.height});
                    })
                }
            }
        }

        return config;
    }
})();
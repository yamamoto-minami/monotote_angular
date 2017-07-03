(function(){
    "use strict";

    angular
    .module('cmp.customImg', [])
    .directive('customImg', CustomImgDirective);
    
    function CustomImgDirective()
    {
        var config = {
            restrict: 'A',
            templateUrl: 'components/customImg/customImg.html',
            link: link
        };
        
        function link(scope, element, attrs)
        {
            scope.imagePath = 'url(' + attrs.src + ')';
            scope.fallbackImagePath = 'url(' + attrs.fallbackSrc + ')';
            var img = new Image();
            img.src = attrs.src;
            img.onload = imgLoadCallback.bind(img, 1);
            img.onerror = imgLoadCallback.bind(img, 0);
            
            function imgLoadCallback(success){
                if(!success){
                    scope.$apply(function(){
                       scope.imgNotFound = true; 
                    });
                }
                img = null;
            }
        }
        
        return config;
    }  
})();
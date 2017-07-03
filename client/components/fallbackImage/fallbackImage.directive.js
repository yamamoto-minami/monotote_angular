'use strict';

// Usage when you want to load images and only show default image when it fails.
// <img ng-src="{{url}}" fallback-src="default.jpg"/>
angular.module('cmp.fallback',[])
  .directive('fallbackSrc', function () {
    return {
      link: function (scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.fallbackSrc) {
            attrs.$set('src', attrs.fallbackSrc);
          }
        });

        attrs.$observe('ngSrc', function(value) {
          if (!value && attrs.fallbackSrc) {
            attrs.$set('src', attrs.fallbackSrc);
          }
        });
      }
    }
});

// Usage when you want to show the default image until the pre-loaded images complete.
// <img actual-src="{{url}}" ng-src="default.jpg"/>
angular.module('cmp.fallback')
  .directive('actualSrc', function () {
    return{
        link: function postLink(scope, element, attrs) {
            attrs.$observe('actualSrc', function(newVal, oldVal){
                 if(newVal != undefined){
                     var img = new Image();
                     img.src = attrs.actualSrc;
                     angular.element(img).bind('load', function () {
                         element.attr("src", attrs.actualSrc);
                     });
                 }
            });

        }
    }
});


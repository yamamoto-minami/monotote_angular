'use strict';

angular.module('cmp.rangeSlider', [])
  .directive('rangeSlider', function () {
    return {
      restrict: 'A',
      scope: {
        value: '=?',
        min: '=?',
        max: '=?',
        rangeValue: '=',
        slide: '&'
      },
      link: function (scope, element) {
        scope.min = scope.min || 0;
        scope.max = scope.max || 100;
        scope.rangeValue = scope.rangeValue || 0;
        scope.sliding = false;

        scope.$watch('max', function() {
          // rewire jquery plugin on max value change
          angular.element(element).noUiSlider({
            range: {
              'min': scope.min,
              'max': scope.max
            }
          }, true);
        });

        scope.$watch('rangeValue', function(value) {
          if (scope.isSliding) { return; }
          angular.element(element).val(value);
        });

        var opt = {
          behaviour: 'tap-drag',
          start: [scope.rangeValue],
          range: {
            'min': scope.min,
            'max': scope.max
          }
        };

        // wire jquery plugin
        angular.element(element)
        .noUiSlider(opt)
        .on({
          slide: function(evt, value){
            // use scope.$apply any time we respond to changes from outside of Angular
            scope.$apply(function() {
              scope.isSliding = true;
              scope.rangeValue = value;
              scope.slide({value: value});
            });

          },
          set: function(){
            scope.isSliding = false;
          },
          change: function(){
            scope.isSliding = false;
          }
        });

      }
    };
  });


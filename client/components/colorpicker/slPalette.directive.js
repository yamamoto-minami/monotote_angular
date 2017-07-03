(function () {
    'use strict';

    angular
        .module('cmp.colorPicker')
        .directive('slPalette', SLPickerDirective);

    SLPickerDirective.$inject = ['$window']
    function SLPickerDirective($window) {
        var config = {
            restrict: 'A',
            require: 'ngModel',
            scope: true,
            link: link
        };

        function link(scope, element, attrs, ngModelController) {
          
            if (element.is('canvas') === false) {
                throw new Error('Canvas element is required!');
            }

            scope.width = null;
            scope.height = null;
            scope.startMovement = startMovement;
            scope.move = move;
            scope.endMovement = endMovement;

            var canvas = element.get(0);

            attrs.$observe('width', function (val) {
                scope.width = val || '';
            })

            attrs.$observe('height', function (val) {
                scope.height = val || '';
            })

            scope.$watchGroup(['width', 'height','hsla.h'], function () {
                if (scope.width != null && scope.height != null && scope.hsla != null) {
                    scope.hue = 'hsl('+Math.round(scope.hsla.h*360.0)+',100%,50%)';
                    update();
                }
            })

            ngModelController.$render = function(){};

            scope.setupInput(scope, element);

            function startMovement($event) {
                scope.oldS = $event.offsetX / element.get(0).offsetWidth;
                scope.oldL = 1 - $event.offsetY / element.get(0).offsetHeight;
                ngModelController.$setViewValue(angular.extend(ngModelController.$viewValue, {
                    s: Math.min(1, Math.max(0, scope.oldS)),
                    l: Math.min(1, Math.max(0, scope.oldL))
                }));
            }

            function move(offsetX, offsetY) {
                ngModelController.$setViewValue(angular.extend(ngModelController.$viewValue, {
                    s: Math.min(1, Math.max(0, scope.oldS + offsetX / element.get(0).offsetWidth)),
                    l: Math.min(1, Math.max(0, scope.oldL - offsetY / element.get(0).offsetHeight))
                }));
            }

            function endMovement($event) {}

            function update() {
                paint();
            }

            function paint() {
                var context, gradient, color;
                var w = element.get(0).width;
                var h = element.get(0).height;

                context = canvas.getContext("2d");

                context.fillStyle = scope.hue;
                context.fillRect(0, 0, w, h);
                gradient = context.createLinearGradient(0, 0, w, 0);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                context.fillStyle = gradient;
                context.fillRect(0, 0, w, h);
                gradient = context.createLinearGradient(0, h, 0, 0);
                gradient.addColorStop(0, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                context.fillStyle = gradient;
                context.fillRect(0, 0, w, h);
            }
        }
        
        return config;
    }
})();

(function () {
    'use strict';

    angular
        .module('cmp.colorPicker')
        .directive('alphaPalette', AlphaPickerDirective);

    AlphaPickerDirective.$inject = ['$window']
    function AlphaPickerDirective($window) {
        var config = {
            restrict: 'A',
            require: ['ngModel','^colorPicker'],
            scope: true,
            link: link
        };

        function link(scope, element, attrs, dependencies) {
            var ngModelController = dependencies[0];
            var colorPickerController = dependencies[1];

            if (element.is('canvas') === false) {
                throw new Error('Canvas element is required!');
            }

            scope.width = null;
            scope.height = null;
            scope.startMovement = startMovement;
            scope.move = move;
            scope.endMovement = endMovement;

            var canvas = element.get(0);
            var context = canvas.getContext("2d");
            context.globalCompositeOperation = 'copy';

            attrs.$observe('width', function (val) {
                scope.width = val || '';
            })

            attrs.$observe('height', function (val) {
                scope.height = val || '';
            })

            scope.$watchGroup(['width', 'height'], update);
            scope.$watch('hsla', update, true);

            colorPickerController.scope.setupInput(scope, element);
            ngModelController.$render = update;

            function startMovement($event) {
                scope.currentValue = scope.oldValue = 1-Math.min(1, Math.max(0, $event.offsetY / element.get(0).offsetHeight));
                updateValue();
            }

            function move(offsetX, offsetY) {
                scope.currentValue = Math.min(1, Math.max(0, scope.oldValue - offsetY / element.get(0).offsetHeight));
                updateValue();
            }

            function endMovement($event) {
            }

            function updateValue(){
                ngModelController.$setViewValue(angular.extend(ngModelController.$viewValue, {
                    a: scope.currentValue
                }));
            }

            function update() {
                paint();
            }

            function paint() {
                if(scope.width == null || scope.height == null || scope.hsla == null) {
                    return;
                }

                var gradient, color;
                var w = element.get(0).width;
                var h = element.get(0).height;

                gradient = context.createLinearGradient(0, h, 0, 0);

                var rgb = colorPickerController.scope.getColor();

                gradient.addColorStop(0, 'rgba('+rgb+', 0)');
                gradient.addColorStop(1, 'rgba('+rgb+', 1)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, w, h);
            }
        }
        
        return config;
    }


})();

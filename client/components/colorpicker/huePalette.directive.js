(function () {
    'use strict';

    angular
        .module('cmp.colorPicker')
        .directive('huePalette', HuePickerDirective);

    HuePickerDirective.$inject = ['$window']
    function HuePickerDirective($window) {
        var config = {
            restrict: 'A',
            require: ['ngModel','^colorPicker'],
            scope: {
                ngModel: '&'
            },
            link: link
        };

        function link(scope, element, attrs, dependencies) {
            var ngModelController = dependencies[0];
            var colorPickerController = dependencies[1];
            var hue = [
                [255, 0, 0],
                [255, 0, 255],
                [0, 0, 255],
                [0, 255, 255],
                [0, 255, 0],
                [255, 255, 0],
                [255, 0, 0]
            ];

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

            attrs.$observe('width', function (val) {
                scope.width = val || '';
            })

            attrs.$observe('height', function (val) {
                scope.height = val || '';
            })

            scope.$watchGroup(['width', 'height'], function () {
                if (scope.width != null && scope.height != null) {
                    update();
                }
            })

            colorPickerController.scope.setupInput(scope, element);

            function startMovement($event) {
                scope.currentValue = scope.oldValue = Math.min(1, Math.max(0, $event.offsetY / element.get(0).offsetHeight));
                updateValue();
            }

            function move(offsetX, offsetY) {
                scope.currentValue = Math.min(1, Math.max(0, scope.oldValue + offsetY / element.get(0).offsetHeight));
                updateValue();
            }

            function endMovement($event) {}

            function updateValue(){
                ngModelController.$setViewValue(scope.currentValue);
            }

            function update() {
                paint();
            }

            function paint() {
                var gradient, color;
                var w = element.get(0).width;
                var h = element.get(0).height;

                gradient = context.createLinearGradient(0, h, 0, 0);

                for (var i = 0; i < hue.length; i++) {
                    color = 'rgb(' + hue[i][0] + ',' + hue[i][1] + ',' + hue[i][2] + ')';
                    gradient.addColorStop(i / (hue.length-1), color);
                };

                context.fillStyle = gradient;
                context.fillRect(0, 0, w, h);
            }
        }
        
        return config;
    }
})();

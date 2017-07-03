(function () {
    'use strict';

    angular
        .module('cmp.colorPicker', [])
        .directive('colorPicker', ColorPickerDirective);

    ColorPickerDirective.$inject = ['$window']
    function ColorPickerDirective($window) {
        var config = {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                ngModel: '&'
            },
            templateUrl: 'components/colorpicker/colorPicker.html',
            link: link,
            controller: Controller
        };

        Controller.$inject = ['$scope']
        function Controller(scope) {

            this.scope = scope;

            scope.getRGBA = getRGBA;
            scope.makeHSL = makeHSL;
            scope.rgb2hsl = rgb2hsl;
            scope.getColor = getColor;
            scope.getCanvas = getCanvas;
            scope.getContext = getContext;
            scope.setupInput = setupInput;

            var canvas = $window.document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            var context = canvas.getContext('2d');
            context.globalCompositeOperation = 'copy';

            function getCanvas() {
                return canvas;
            }

            function getContext() {
                return context;
            }

            function makeHSL(hsl) {
                return 'hsl(' + Math.round(hsl.h * 360.0) + ',' + Math.round(hsl.s * 100.0) + '%,' + Math.round(hsl.l * 100.0) + '%)';
            }

            function getColor() {
                var rgba = getRGBA(makeHSL({h:scope.hsla.h, s:1, l:0.5}));
                return mix(mix(rgba, [255,255,255], 1-scope.hsla.s), [0, 0, 0,], 1-scope.hsla.l);
            }

            function mix(src, dst, val) {
                if(typeof(src) === 'number') {
                    src = [src, src, src];
                }
                if(typeof(dst) === 'number') {
                    dst = [dst, dst, dst];
                }
                return [
                    Math.round(dst[0]*val+(1-val)*src[0]),
                    Math.round(dst[1]*val+(1-val)*src[1]),
                    Math.round(dst[2]*val+(1-val)*src[2]),
                ]
            }

            function getRGBA(anyColorFormat) {
                context.fillStyle = anyColorFormat;
                context.fillRect(0, 0, 1, 1);
                var data = context.getImageData(0, 0, 1, 1).data;
                return [data[0],data[1],data[2],data[3]];
            }

            function rgb2hsl(anyColorFormat) {
                var rgba = getRGBA(anyColorFormat);
                var rr, gg, bb,
                    r = rgba[0] / 255,
                    g = rgba[1] / 255,
                    b = rgba[2] / 255,
                    a = rgba[3] / 255;
                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                var h, s, l = (max + min) / 2;

                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }

                    h /= 6;
                }
                return {
                    h: h,
                    s: s,
                    l: l,
                    a: a
                };
            }

            function setupInput(targetScope, element) {

                var startX, startY;
                var revertCallback = null;

                element.on('mousedown', onStart);
                element.on('touchstart', onStart);
                targetScope.$on('destroy', function(){
                    element.off('mousedown', onStart);
                    element.off('touchstart', onStart);
                });
                
                function onStart(e) {
                    if(e.touches != null && e.touches.length) {
                        if(e.touches.length !== 1) {
                            return;
                        }
                        e.preventDefault();
                        e.pageX = e.touches[0].pageX;
                        e.pageY = e.touches[0].pageY;
                        var elOffset = element.offset();
                        e.offsetX = e.touches[0].pageX - elOffset.left;
                        e.offsetY = e.touches[0].pageY - elOffset.top;
                    }
                    scope.dragging = true;
                    angular.element($window).on('mousemove', onMove);
                    angular.element($window).on('mouseup', onEnd);
                    angular.element($window).on('touchmove', onMove);
                    angular.element($window).on('touchend', onEnd);
                    targetScope.startMovement(e);
                    scope.$apply();
                    startX = e.pageX;
                    startY = e.pageY;

                    revertCallback = targetScope.$on('$destroy', function(){
                        angular.element($window).off('mousemove', onMove);
                        angular.element($window).off('mouseup', onEnd);
                        angular.element($window).off('touchmove', onMove);
                        angular.element($window).off('touchend', onEnd);
                    })
                }

                function onMove(e) {
                    if(e.touches != null && e.touches.length === 1) {
                        e.pageX = e.touches[0].pageX;
                        e.pageY = e.touches[0].pageY;
                    }
                    targetScope.move(e.pageX - startX, e.pageY - startY);
                    targetScope.$apply();
                }

                function onEnd(e) {
                    if(e.touches != null && e.touches.length) {
                        e.pageX = e.touches[0].pageX;
                        e.pageY = e.touches[0].pageY;
                    }
                    angular.element($window).off('mousemove', onMove);
                    angular.element($window).off('mouseup', onEnd);
                    angular.element($window).off('touchmove', onMove);
                    angular.element($window).off('touchend', onEnd);
                    scope.dragging = false;
                    targetScope.endMovement(e);
                    scope.$apply();
                    revertCallback();
                }

            }

        }

        function link(scope, element, attrs, ngModelController) {

            ngModelController.$render = function () {
                var newValue = ngModelController.$viewValue;
                var hslaModel = scope.rgb2hsl(newValue);
                scope.getContext().fillStyle = 'hsl(' + Math.round(hslaModel.h * 360) + ',100%,50%)';
                scope.getContext().fillRect(0, 0, 1, 1);
                var rgba = scope.getContext().getImageData(0, 0, 1, 1).data;
                scope.hsla = hslaModel;
            };

            scope.hsla = { h: 0, s: 0, l: 0, a: 1 };

            scope.$watch('hsla', function(val){
                if(!scope.dragging) { return; }
                var rgb = scope.getColor();
                if(scope.hsla.a < 1) {
                    ngModelController.$setViewValue('rgba('+rgb.join(',')+','+Math.round(scope.hsla.a*1000.0)/1000.0+')')
                } else {
                    var hex = makeHex(rgb[0])+makeHex(rgb[1])+makeHex(rgb[2]);
                    if(hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
                        hex = hex[0]+hex[2]+hex[4];
                    }
                    ngModelController.$setViewValue('#'+hex);
                }
            }, true);

            function makeHex(val) {
                var hex = val.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }

        }

        return config;
    }

})();

(function(){
    "use strict";

    angular
    .module('cmp.itemSelect')
    .directive('itemSelect', ItemSelectDirective);

    ItemSelectDirective.$inject = ['$window'];
    function ItemSelectDirective($window)
    {
        var config = {
            templateUrl: 'components/itemSelect/itemSelect.html',
            link: link,
            transclude: true,
            replace: true,
            controller: ItemSelectController,
            require: 'ngModel',
            scope: true
        };

        function link(scope, element, attrs, ngModelController)
        {
            scope.setValue = setValue;
            scope.placeholder = '';
            scope.name = '';
            scope.required = false;
            scope.disabled = false;
            scope.class = [''];
            scope.population = [];

            scope.itemSelectController.setValue = setValue;
            scope.itemSelectController.itemOver = null;
            scope.itemSelectController.setItemFocus = setItemFocus;
            scope.itemSelectController.getItemFocus = getItemFocus;
            
            scope.itemSelectController.populate = populate;
            scope.itemSelectController.updatePopulation = updatePopulation;
            scope.focus = focus;
            scope.onFocus = onFocus;
            scope.onKeyDown = onKeyDown;
            scope.onKeyUp = onKeyUp;

            var inputElement = element[0].querySelector('input[ng-model="value"]');
            var listElement = element.find('ul');

            attrs.$observe('placeholder', function (val) {
                scope.placeholder = val || '';
            });

            attrs.$observe('name', function (val) {
                scope.name = val || '';
            });

            attrs.$observe('class', function (val) {
                scope.class = [val || ''];
            });
            
            attrs.$observe('tabIndex', function (val) {
                inputElement.tabIndex = val;
            });

            angular.element($window).on('resize', smartPositionDropdownMenu);
            angular.element($window).on('scroll', smartPositionDropdownMenu);

            scope.$on('$destroy', function(){
                angular.element($window).off('resize', smartPositionDropdownMenu);
                angular.element($window).off('scroll', smartPositionDropdownMenu);
            });

            scope.$watch(attrs.required, function(val){
                scope.required = !!val;
                checkRequirement();
            });

            scope.$watch(attrs.disabled, function(val){
                scope.disabled = !!val;
            });

            ngModelController.$render = function(){
                ngModelController.$viewValue == null && setValue(null, ""); // this selector requires 2 inputs (a value and a displayable string) hence we can't find out what the second should be when we have 1, so we can only clear values when null is passed
            };

            function focus()
            {
                inputElement.focus();
            }

            function onFocus() {
                scope.itemFocus = null;

                smartPositionDropdownMenu();
            }

            function smartPositionDropdownMenu() {
                listElement.removeClass('upward');
                listElement.css('max-height', '300px');

                $window['requestAnimationFrame' || 'setTimeout'](function smartPositioning(smart){
                    var viewport = getParentViewport();
                    var listRect = listElement[0].getBoundingClientRect();
                    var viewportRect = viewport ? viewport.getBoundingClientRect() : {height: innerHeight};
                    if(listRect.bottom > viewportRect.height) {
                        var bottom = viewportRect.height - listRect.bottom;
                        listElement.addClass('upward');
                        listRect = listElement[0].getBoundingClientRect();
                        if(listRect.top < 0) {
                            if(listRect.top > bottom) {
                                listElement.css('max-height', listRect.height + listRect.top + 'px');
                            }
                            else {
                                listElement.removeClass('upward');
                                listElement.css('max-height', listRect.height + bottom + 'px');
                            }
                        }
                    }
                });
            }

            function setItemFocus(index, el) {
                scope.itemFocus = index;
            }

            function getItemFocus() {
                return scope.itemFocus;
            }

            function onKeyDown(ev) {
                if(ev.keyCode === 38 || ev.keyCode === 40){
                    ev.preventDefault();
                    if(scope.population.length) {
                        scope.showList = true;
                        scope.itemFocus = scope.itemFocus == null ? 0 : Math.min(Math.max(scope.itemFocus + (ev.keyCode === 40 ? 1 : -1), 0), scope.population.length - 1);
                        
                        var offset = scope.population[scope.itemFocus].getOffset();
                        var listHeight = listElement.height();
                        var listScroll = listElement.scrollTop();
                        var itemHeight = scope.population[scope.itemFocus].getHeight();

                        if(offset.top > listScroll && offset.top + itemHeight > listScroll + listHeight) {
                            listElement.scrollTop(offset.top + itemHeight - listHeight);
                        }
                        if(offset.top < listScroll && offset.top < listScroll) {
                            listElement.scrollTop(offset.top);
                        }
                    }
                }
            }

            function onKeyUp(ev) {
                if(ev.keyCode === 13) {
                    ev.preventDefault();
                    scope.showList = false;
                    scope.itemFocus != null && scope.population[scope.itemFocus].select();
                }
            }

            function populate(itemScope) {
                scope.population.push(itemScope);
            }

            function updatePopulation(removedItemScope) {
                scope.population.splice(scope.population.indexOf(removedItemScope), 1);

                if(scope.itemSelectController.itemOver > scope.population.length) {
                    scope.itemFocus--;
                }
                if(scope.population.length === 0) {
                    scope.itemFocus = null;
                }
            }

            function getParentViewport(){
                for(var el = element[0].parentNode; el != null && el !== $window.document; el = el.parentNode) {
                    switch($window.getComputedStyle(el)['overflow-y']) {
                        case 'hidden': return null;
                        case 'auto':
                        case 'scroll': return el;
                    }
                }
                return null;
            }

            function setValue(item, displayValue)
            {
                scope.value = displayValue;
                ngModelController.$setViewValue(item);
                checkRequirement();
            }

            function checkRequirement()
            {
                ngModelController.$setValidity('required', scope.required ? !!scope.value : true);
            }
        }

        ItemSelectController.$inject = ['$scope'];
        function ItemSelectController($scope)
        {
            var self = this;

            $scope.itemSelectController = self;
        }

        return config;
    }
})();
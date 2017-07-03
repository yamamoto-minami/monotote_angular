(function(){
    "use strict";

    angular
    .module('cmp.itemSelect')
    .directive('itemOption', ItemOptionDirective);

    function ItemOptionDirective()
    {
        var config = {
            templateUrl: 'components/itemSelect/itemSelectOption.html',
            link: link,
            require: '^itemSelect',
            replace: true,
            transclude: true
        };

        function link(scope, element, attrs, itemSelectController)
        {

            itemSelectController.populate(scope);

            scope.$on('$destroy', function(){
                itemSelectController.updatePopulation(scope);
            })

            scope.select = select;
            scope.focus = focus;
            scope.hasFocus = hasFocus;
            scope.getHeight = getHeight;
            scope.getOffset = getOffset;
            attrs.select && scope.$watch(attrs.select, function(v){
                v && select();
            });

            function select()
            {
                itemSelectController.setValue(attrs.value, attrs.display || element.text().trim());
            }

            function focus()
            {
                itemSelectController.setItemFocus(scope.$index, element);
            }

            function hasFocus()
            {
                return itemSelectController.getItemFocus() === scope.$index;
            }

            function getHeight()
            {
                return element.height();
            }

            function getOffset()
            {
                return {
                    top: element[0].offsetTop
                };
            }
        }

        return config;
    }
})();
'use strict';

angular.module('cmp.tabpane')
.directive('tabpane', function() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            callback: '&'
        },
        templateUrl: 'components/tabpane/tabpane.html',
        controller: 'tabpaneCtrl',
        link: function(scope, element, attributes) {
            scope.prefix = attributes.prefix || 'tabpane';
        }
    };
})
.directive('tab', function() {
    return {
        require: '^tabpane',
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: 'components/tabpane/tabpane-content.html',
        scope: {
            heading: '@',
            enabled: '=?'
        },
        link: function(scope, element, attrs, tabpaneCtrl) {
            tabpaneCtrl.addPane(scope, attrs);
        }
    };
});

'use strict';

angular.module('cmp.productFilter')
.controller('productFilterCtrl', function($scope, _, $element, $timeout, Product) {

    var debounceUpdate = _.debounce(function() {
        $scope.$emit('product.filter.update', parseFilter(), {hideProductDetails:true});
    }, 750, { leading: true });

    var activeClass = 'active';
    var selectMultipleValues = false;
    $scope.setupFilterItems = setupFilterItems;

    if(!$scope.data){
        $scope.data = {};
        $scope.data.department = Product.getDepartment();
    }
    $scope.$watch('data.department', function(newVal,oldVal){
       if(newVal===oldVal){return;}
       Product.setDepartment($scope.data.department);
       $scope.result = {};
       $scope.$emit('product.filter.update', parseFilter(), {hideProductDetails:true});
    });
    
    $scope.result = $scope.selection;
    $scope.$watch('selection', function() {
        if ($scope.selection)
            $scope.result = $scope.selection;
        if ($scope.selection && $scope.filters && $scope.filters.results) {
            
            var categoryFilter = _.find($scope.filters.results, function(filter){
                return filter.key === 'category'
            });
            
            var countryFilter = $scope.universe === 'zalando' && $scope.filters.results[0];
            
            categoryFilter && !countryFilter && setDefaultToAllForCategory(categoryFilter);
        }
    });

    $scope.updatefilter = function(evt, filter, item) {
        var countryFilter = $scope.filters.results[0];
        if(filter === countryFilter && $scope.universe === 'zalando')
        {
            $scope.result = {};
            $scope.result[filter.key] = item.value;
        }
        else
        {
            $scope.result[filter.key] = $scope.result[filter.key] == item.value ? null : item.value;
        }

        if (selectMultipleValues) {
            debounceUpdate();
        } else {
            $scope.$emit('product.filter.update', parseFilter(), {hideProductDetails:true});
        }
        
        if(filter !== countryFilter || $scope.universe !== 'zalando')
            setDefaultToAllForCategory(filter);
    };

    function parseFilter() {
        var result = {};
        _.forEach($scope.result, function(v, k) {
            if(v != null) result[k] = v;
        });
        return result;
    }
    
    function setDefaultToAllForCategory(filter)
    {
        switch($scope.universe)
        {
            case 'monotote':
            case 'awin':
            return;
        }
        if(!filter || filter.key !== 'category') return;
        if($scope.selection && $scope.selection[filter.key] == null && filter.facets.length && filter.facets[0].level === 0)
        {
            $scope.selection[filter.key] = filter.facets[0].value;
            $scope.$emit('product.filter.update', parseFilter(), {replaceUrl:true, append: true}); // update other filters
        }
    }
    
    function setupFilterItems(filter)
    {
        // fix item.key -> item.value for amazon API
        if($scope.universe === 'amazon')
        {
            filter.facets.forEach(function(item){
                item.value = item.value || item.key;
            });
        }

        if(filter.type === 'select')
        {
            $scope.data.facetsByKey = {};
            filter.facets.forEach(function(item){
                $scope.data.facetsByKey[item.value] = item;
            })
        }
        
        setDefaultToAllForCategory(filter);
        
        //if($scope.universe !== 'monotote') return;
        if(filter.type !== 'radio' || $scope.universe === 'zalando') return;
        // make hierarchy of items
        for(var i = 1; i < filter.facets.length; i++)
        {
            var l = filter.facets[i].level;
            for(var j = i-1; j >= 0; j--)
            {
                if(filter.facets[j].level < l)
                {
                    filter.facets[i].parent = filter.facets[j];
                    break;
                }
            }
        }
        
        if($scope.selection && $scope.selection[filter.key] != null)
        {
            var itemIndex = _.findIndex(filter.facets, function(item){
                return item.value == $scope.selection[filter.key];
            });
            
            if(itemIndex != -1)
            {
                var item = filter.facets[itemIndex];
                item.show = true;
                // expose all upper levels of item
                for(var it = item.parent; it; it = it.parent)
                {
                    it.show = true;
                }
            }
        }
        
        
    }

});

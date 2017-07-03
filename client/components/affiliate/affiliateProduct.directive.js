(function(){
    "use strict";

    angular
    .module('cmp.affiliate')
    .directive('affiliateProduct', AffiliateProductDirective);

    AffiliateProductDirective.$inject = ['$timeout','$document','AffiliateService','Copy2ClipboardFactory'];
    function AffiliateProductDirective($timeout,$document,AffiliateService,Copy2ClipboardFactory)
    {
        var config = {
            restrict: 'EA',
            link: link,
            templateUrl: 'components/affiliate/affiliateProduct.html',
            scope: {
                product: '='
            }
        };

        function link(scope, element, attrs)
        {
            scope.getText = getText;
            scope.copy2Clipboard = copy2Clipboard;
            scope.objectId = scope.$id;
            scope.onCopy = onCopy;

            scope.product_sku = scope.product ? scope.product.parent_sku || scope.product.sku : null;
            
            scope.copyStatusSuccess = null;
            getLink();

            function getLink()
            {
                if(!scope.product_sku) return;
                AffiliateService
                .getProductAffiliateLink(scope.product_sku)
                .then(function(link){
                    scope.link = link;
                }, function(){
                    scope.link = scope.product.url;
                });
            }

            function getText()
            {
                return angular.element('#code-'+scope.objectId).text().replace(/^\s+/,'').replace(/\s+$/,'');
            }

            function onCopy(automatedCopy)
            {
                if(!automatedCopy) return;
                if(scope.copyStatusSuccess)
                        $timeout.cancel(scope.copyStatusSuccess);
                scope.copyStatusSuccess = $timeout(function(){
                     scope.copyStatusSuccess = null;
                }, 2000);
            }

            function copy2Clipboard(text)
            {
                Copy2ClipboardFactory(text)
                .then(onCopy);
            }
        }

        return config;
    }
})();
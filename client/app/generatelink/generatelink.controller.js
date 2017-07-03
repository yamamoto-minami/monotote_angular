(function(){
    "use strict";

    angular
    .module('app.generatelink')
    .controller('GenerateLinkController', GenerateLinkController);

    GenerateLinkController.$inject = ['$scope', '$state', '$stateParams', '$timeout', '$log', 'ngDialog', '_', 'Copy2ClipboardFactory', 'Base64Factory', 'Publisher'];
    function GenerateLinkController($scope, $state, $stateParams, $timeout, $log, ngDialog, _, Copy2ClipboardFactory, Base64Factory, Publisher)
    {
        $scope.showProductBrowser = showProductBrowser;
        $scope.products = [];
        $scope.pageUrl = "";
        $scope.getText = getText;
        $scope.onCopy = onCopy;
        $scope.copy2Clipboard = copy2Clipboard;
        $scope.generateLink = generateLink;
        $scope.removeProduct = removeProduct;
        $scope.openInProductBrowser = openInProductBrowser;

        getCompanyWebsiteUrl();
        
        function openInProductBrowser(sku) {
            var productBrowser = ngDialog.open({
                templateUrl: 'components/productBrowser/modal.html',
                className: 'ngdialog-theme-productBrowser',
                showClose: false,
                closeByEscape: false,
                closeByDocument: false,
                overlay: false,
                disableAnimation: true,
                data: {
                    loadSKU: sku
                },
                controller: 'productBrowserCtrl'
            });

            var currentStateName = $state.current.name,
                currentParams = angular.copy($stateParams);
            $state.go('productBrowser', {}, {notify:false});

            var offWatchParentClose = $scope.$on('$destroy', function(){
                productBrowser.close();
            });

            productBrowser.closePromise
            .then(function (data) {
                offWatchParentClose();
                $state.current.name !== 'login' && $state.go(currentStateName, currentParams, {notify: false});
                if (data.value && data.value.product) {
                    var sku = _.get(data.value, 'product.sku');
                    if(!_.find($scope.products, {sku:sku})) {
                        $scope.products.push(angular.extend(data.value.product, {
                            sku: _.get(data.value, 'product.sku'),
                            name: _.get(data.value, 'product.name'),
                            brand: _.get(data.value, 'product.partner_name'),
                            price: _.get(data.value, 'product.price'),
                            special_price: _.get(data.value, 'product.special_price'),
                            currency: _.get(data.value, 'product.currency')
                        }));
                    }
                }
            });
        }

        function showProductBrowser(evt) {
            var productBrowser = ngDialog.open({
                templateUrl: 'components/productBrowser/modal.html',
                className: 'ngdialog-theme-productBrowser',
                showClose: false,
                closeByEscape: false,
                closeByDocument: false,
                overlay: false,
                disableAnimation: true,
                controller: 'productBrowserCtrl'
            });

            var currentStateName = $state.current.name,
                currentParams = angular.copy($stateParams);
            $state.go('productBrowser', {}, {notify:false});

            var offWatchParentClose = $scope.$on('$destroy', function(){
                productBrowser.close();
            });

            productBrowser.closePromise
            .then(function (data) {
                offWatchParentClose();
                $state.current.name !== 'login' && $state.go(currentStateName, currentParams, {notify: false});
                if (data.value && data.value.product) {
                    $scope.products.push(angular.extend(data.value.product, {
                        sku: _.get(data.value, 'product.sku'),
                        name: _.get(data.value, 'product.name'),
                        brand: _.get(data.value, 'product.partner_name'),
                        price: _.get(data.value, 'product.price'),
                        special_price: _.get(data.value, 'product.special_price'),
                        currency: _.get(data.value, 'product.currency')
                    }));
                }
            });
        }

        function getCompanyWebsiteUrl()
        {
            Publisher.profile()
            .then(function(res){
                $log.debug('profile: ', res);
                $scope.pageUrl = _.get(res, 'company.website') || $scope.pageUrl;
            })
        }

        function removeProduct(product)
        {
            _.pull($scope.products, product);
        }

        function generateLink()
        {
            var selectProducts = $scope.products.map(function(x){
                return x.parent_sku || x.sku;
            }).join(';');
            if($scope.products.length > 1)
                selectProducts = Base64Factory.encode(selectProducts); 
            $scope.resultLink = $scope.pageUrl && $scope.products.length ?
                $scope.pageUrl.replace(/#.*$/,'')+'#monotote-product' + ($scope.products.length > 1 ? 's':'') +'|'+selectProducts :
                '';
        }

        function getText()
        {
            return $scope.resultLink;
        }

        function onCopy(automatedCopy)
        {
            if(!automatedCopy) return;
            if($scope.copyStatusSuccess)
                $timeout.cancel($scope.copyStatusSuccess);
            $scope.copyStatusSuccess = $timeout(function(){
                $scope.copyStatusSuccess = null;
            }, 2000);
        }

        function copy2Clipboard(text)
        {
            Copy2ClipboardFactory(text)
            .then(onCopy);
        }
    }

})();
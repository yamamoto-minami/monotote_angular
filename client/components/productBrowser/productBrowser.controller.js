'use strict';

angular.module('cmp.productBrowser', ['cmp.product'])
.constant('ProductBrowserUiScreenStates', {
  MAIN_SCREEN: 'search',
  VIEW_PRODUCT: 'view_product',
  UNIVERSE_SEARCH: 'universe_search'
})
.controller('productBrowserCtrl', function ($scope, $element, Product, _, $q, Thumbnail,
  SCT_CONFIG, $window, CURRENCY, $timeout, $log, $sce, $state, $location, ProductBrowserUiScreenStates, PageLeaveLockService, Auth) {

  var offProductSelected, offFilterUpdate, offDoSearch, offProductSearch;
  $scope.template = 'components/productBrowser/category.html';
  $scope.templates = {
      loadingIndicator: 'components/loader/loadingIndicator.html',
      universeQueryLoading: 'components/productBrowser/category-universe-loading.html',
      universeQueryResult: 'components/productBrowser/category-universe-result.html'
  };

  $scope.loadingProduct = false;

  $scope.data = {
      universes: {},
      universe: null,
      universeFilters: null,
      queryKeywords: '',
      queryUniverses: null,
      queryResult: null,
      queryHasResult: false,
      queryLoading: 0, // same as queryHasResult (for spinner) but it used for multiple concurrent actions (fetch products & facets) in details.html 
      filter: null,
      categories: {},
      universeCategories: null, // categories mapped by universe
      keywords: [],
      sortOptions: null,
      sort: '',
      pager: {
        page: 1,
        start: 0,    // current page shows from product n
        end: null,   // current page shows to product n
        total: null, // total number of products in result
        step: 30
      }
  };
  $window.$location = $location;
  $scope.updateKeywords = updateKeywords;

  var locationUrl = null;
  $scope.$watch(function(){
    return $location.absUrl();
  }, function(val){
    $log.debug('location url change', val);
    locationUrl = val;
  })

  $scope.$on('$locationChangeSuccess', function($event, toUrl, fromUrl){
    $log.debug('location change success', arguments, locationUrl);
  });

  $scope.$on('$locationChangeStart', function($event, toUrl, fromUrl){
    $log.debug('location change start', arguments, locationUrl);
    if($location.path() !== $state.current.url)
      return $timeout(function(){
        $scope.closeThisDialog();
      });
    if(toUrl !== locationUrl) {
      loadFromUrl();
    }
  });

  $scope.$on('$stateChangeStart', function($event){
    Auth.getIdentity()['api-key'] && $scope.data && $event.preventDefault();
  });

  PageLeaveLockService.push();

  $scope.$on('$destroy', function(){
    PageLeaveLockService.pop();
  });

  $scope.data.queryLoading++;
  Product.universes()
  .then(function(data) {
      $scope.data.universes = data;
      return data;
  })
  .then(function(universes) {
      return Product.categories()
      .then(function(data) {
          $scope.data.categories = data;
          $scope.data.universeCategories = filterCategories(data, universes);
          $scope.data.queryLoading--;
      });
  })
  .then(loadFromUrl);

  function loadFromUrl() {
    return $q.resolve()
    .then(function(){
      var search = angular.copy($location.search());
      $scope.urlSearch = search;
      if(!search.screen) {
        if($scope.ngDialogData && $scope.ngDialogData.loadSKU) {
          $scope.data.loadedSKU = $scope.ngDialogData.loadSKU;
          search = {
            screen:ProductBrowserUiScreenStates.VIEW_PRODUCT,
            sku:$scope.ngDialogData.loadSKU,
          };
          $location.search(search).replace();
          $scope.ngDialogData.loadSKU = null;
        } else {
          return setDefaultState();
        }
      }
      
      var screen = extractProperty(search, 'screen');
      //var keyword = extractProperty(search, 'keyword');
      var department = extractProperty(search, 'department');
      var universe = extractProperty(search, 'universe');
      var page = extractProperty(search, 'page');
      var sku = extractProperty(search, 'sku');
      var subSku = extractProperty(search, 'sub_sku');

      if(_.find(ProductBrowserUiScreenStates,screen) === false)
        return setDefaultState();

      $scope.data.queryKeywords = search.keyword || '';
      $scope.data.universe = universe;
      $scope.data.keywords = [];
      var keywords = $scope.data.queryKeywords.trim().length > 0 ? $scope.data.queryKeywords.split(/\s+/) : [];
      $scope.data.keywords = keywords.length ? _.unique(keywords) : $scope.data.keywords || [];
      $scope.data.queryKeywords = '';

      if(screen === ProductBrowserUiScreenStates.MAIN_SCREEN) {
        var d = $scope.data;
        var universes = $scope.data.queryUniverses = d.universe ? [d.universe] : _.keys(d.universes).sort();
        var keywords, queryKeywords = d.keywords.join(' ').trim();
        $scope.template = 'components/productBrowser/category.html';
        
        $scope.data.filter = null;
        Product.setDepartment(Product.defaultDepartment);
        d.error = '';
        d.queryHasResult = false;
        d.queryResult = null;
        d.page = 1;
        d.sort = '';
        // no keywords clear search results
        if (!d.keywords.length) {
          d.queryResult = null;
          d.queryHasResult = true; //hide the spinner
          return;
        }

        return $q.all(
          _.map(universes, function(u) {
            return doUniverseSearch(u, queryKeywords);
          })
          .concat(d.keywords.length === 1 && queryKeywords ? [Product.detail(queryKeywords)
          .then(function(res) {
            if(!res || !res.product || res.product.disabled) {
              return;
            }
            setProduct(universe, res);
            $scope.showProduct = true;
          }, function(){})] : [])
        ).then(function(data) {
          d.queryHasResult = true;
          d.queryResult = data;
        });
      }
      
      $scope.data.filter = search;
      $scope.data.pager.page = parseInt(page)||1;
      $scope.data.sort = search.sort || '';


      if(screen === ProductBrowserUiScreenStates.VIEW_PRODUCT) {
        $scope.data.queryLoading++;
        return Product.detail(sku)
        .then(function(res) {
          $scope.data.queryLoading--;
          if(res.disabled) {
            $scope.showProductDetailSection();
            return;
          }
          setProduct(universe, res);
          $scope.showSubProduct($scope.data.productMeta[subSku])
          $scope.showProduct = true;
          $scope.$emit('product.filter.update', null, {dontUpdateUrl: true});
        })
      }
      else
      if(screen === ProductBrowserUiScreenStates.UNIVERSE_SEARCH) {
        $scope.$emit('product.filter.update', null, {hideProductDetails:true, dontUpdateUrl: true});
      }

      
    });
  }

  function setDefaultState()
  {
    $location.search({
      screen: ProductBrowserUiScreenStates.MAIN_SCREEN
    }).replace();
    return loadFromUrl();
  }

  function extractProperty(properties, name) {
    var value = properties[name];
    delete properties[name];
    return value;
  }

  $scope.changeSortOrder = function() {
      $scope.data.pager.page = 1;
      $scope.$emit('product.filter.update', generateFilter(), {hideProductDetails:true});
  };

  $scope.removeKeyword = function(keyword) {
    _.remove($scope.data.keywords, function(n) { return n === keyword; });
    $scope.doSearch();
  };

  // wrap Product search to prevent 410 canceling $q.all
  function doUniverseSearch (universe, keywords) {
    return Product.search(universe, { keyword: keywords })
    .then(function(res) {
        return {
            universe: universe,
            keywords: keywords,
            page: res.page,
            products: res.products,
            sortOptions: res.sortOptions
        };
    },function(reason) {
        return {
            universe: universe,
            keywords: keywords,
            error: reason
        };
    });
  }

  $scope.doSearch = function(showCategorySection) {
    $location.search({
      screen: ProductBrowserUiScreenStates.MAIN_SCREEN,
      keyword: $scope.data.queryKeywords.trim() || $scope.data.keywords.join(' ') || null,
      universe: $scope.data.universe
    });

    return loadFromUrl();
  };

  $scope.take = function(products, n) {
    var keys = _.keys(products).slice(0, n);
    var items = _.filter(products, function(p) { return _.indexOf(keys, p.sku) !== -1; });
    return items;
  };

  $scope.changeDetailSectionUniverse = function(universe) {
      $scope.data.sortOptions = null;
      $scope.data.sort = '';
      $scope.data.pager.show = false;
      $scope.data.filter = null;
      $scope.data.filterSelection = null; // holds current filter selection
      onChangeUniverse(universe);
      $scope.$emit('product.filter.update', null, {hideProductDetails:true});
  };

  $scope.changeUniverse = function() {
    //if ($scope.data.keywords.length) {
        $scope.doSearch();
    //}
  };

  function handleError(reason) {
    console.warn(reason);
  }

  $scope.resultCount = function(universe) {
    return _.get($scope.getQueryResult(universe), 'page.total_products') || 0;
  };

  $scope.showProductDetailSection = function(universe, product) {
    $q.resolve()
    .then(function(){
      $scope.data.queryLoading++;
      if(universe){
        $scope.universe = universe;
      }
      clearProduct();
      scrollToTop();
      $scope.showProduct = false;
      $scope.data.pager.show = true;
      $scope.template = 'components/productBrowser/detail.html';
    })
    .then(function(){
      var _find = _.find($scope.data.queryResult, { 'universe': $scope.universe });
      var urlSearch = angular.copy($location.search());
      if(_find){
        $scope.data.sortOptions = _find.sortOptions;
      }
      if (product && !product.disabled) {
        urlSearch.screen = ProductBrowserUiScreenStates.VIEW_PRODUCT;
        urlSearch.universe = universe;
        urlSearch.sku = product.sku;
        $location.search(urlSearch);
        $scope.showProduct = true;
        return Product.detail(product.sku)
        .then(function(res) {
          setProduct(universe, res);
          onChangeUniverse(universe);
        })
      } else {
        if(!$scope.universe){
          return setDefaultState();
        }
        urlSearch.sku = null;
        urlSearch.sub_sku = null;
        urlSearch.screen = ProductBrowserUiScreenStates.UNIVERSE_SEARCH;
        urlSearch.universe = universe || $scope.data.universe;
        $location.search(urlSearch);
        if(_find) {
          var universeResult = _find;
          $scope.data.queryResult = universeResult.products;
          $scope.data.queryKeywords = '';
          //$scope.data.keywords = [];
          $scope.data.universe = $scope.universe;
          onChangeUniverse($scope.universe);
          updatePager(universeResult.page);
        }
      }
    })
    .catch(function(reason) {
      handleError(reason);
    })
    .finally(function(){
      $scope.data.queryLoading--;
    })
  };

  $scope.showSubProduct = function(options) {
    var key = _.findKey($scope.data.productMeta, options);
    if(!key) return null;
    return $scope.data.productMeta[key];
  };

  function productDetails(meta) {
    return {
        colors : _.chain(meta).map('attributes.color').unique().sort().value(),
        sizes : _.chain(meta).map('attributes.size').unique().value(),
        products : _.map(meta, function(v) {
            return {
                sku: _.get(v, 'sku'),
                price: _.get(v, 'price'),
                color: _.get(v, 'attributes.color'),
                size: _.get(v, 'attributes.size')
            };
        })
    };
  }

  function onChangeUniverse(universe) {
    $scope.data.universeFilters = null;
    $scope.data.pager.page = 1;
    updateFilters(generateFilter());
  }

  function onProductSelected($event, product) {
      if (typeof $scope.closeThisDialog === 'function') {
        $scope.closeThisDialog({ product: product, universe: $scope.data.universe });
        $scope.data = null;
        $location.search({});
      }
  }

  function generateFilter() {
    var d = $scope.data;
    var result = {};
    if (d.sort && d.sort.length) {
        result.sort = d.sort;
    }
    if (d.keywords && d.keywords.length) {
        result.keyword = $scope.data.keywords.join(' ');
    }
    return angular.extend({}, $scope.data.filter, result);
  }

  function scrollToTop() {
    var elm = $element[0].getElementsByClassName('product-browser');
    if (elm && elm.length === 1) {
        elm[0].scrollTop = 0;
    }
  }

  function clearProduct() {
      $scope.data.productMeta = null;
      $scope.data.product = null;
      $scope.data.productDetails = null;
      $scope.data.productConfiguration = null;
  }
  
  function updateKeywords()
  {
      $scope.data.filter.keyword = $scope.data.keywords.join(' ');
      $scope.$emit('product.filter.update', null, {hideProductDetails:true});
  }

  function onFilterUpdate(evt, filter, options) {
      var filterValue;
      
      if(!$scope.data.universe) { return; }

      if(!$scope.data.universe) { return; }

      options = options || {};

      if (filter) {
          $scope.data.filter = filter;
          $scope.data.pager.page = 1;
      }

      filterValue = generateFilter();

      if(options.hideProductDetails) {
          clearProduct();
          $scope.showProduct = false;
          $scope.template = 'components/productBrowser/detail.html';

      }
      if(!options.dontUpdateUrl) {
          var urlSearch = angular.copy(filterValue);
          if(options.append) {
            urlSearch = angular.extend(urlSearch, $location.search());
          }
          else {
            urlSearch.screen = ProductBrowserUiScreenStates.UNIVERSE_SEARCH;
          }
          urlSearch.department = $scope.data.universe === 'amazon' && Product.getDepartment() ||  null;
          urlSearch.page = $scope.data.pager.page;
          urlSearch.universe = $scope.data.universe;

          $location.search(urlSearch);

          if(options.replaceUrl) {
            $location.replace();
          }
      }

      scrollToTop();
      $scope.data.pager.show = false;

      $scope.queryLoading++;
      // update products
      Product.search($scope.data.universe, angular.extend(angular.copy(filterValue), {
          department: $scope.data.universe === 'amazon' && Product.getDepartment() ||  null,
          page: $scope.data.pager.page
      }))
      .then(function(res) {
        $scope.data.sortOptions = res.sortOptions;
        $scope.data.queryResult = res.products;
        if(!res.products){
          $scope.data.queryResult = null;
        }
        updatePager(res.page);
      })
      .catch(function(reason) {
         handleError(reason);
      })
      .then(function(){
        $scope.queryLoading--;
      });
      // update the filters
      updateFilters(filterValue);
  }
  
  function updateFilters(filter)
  {
    var filterQuery = angular.copy(filter||{});
    var baseFilter = {};
    return $q.resolve()
    .then(function(){
      $scope.data.queryLoading++;
      if($scope.data.universe === 'amazon'){
        filterQuery.department = Product.getDepartment();
        baseFilter.department = filterQuery.department;
        baseFilter.keyword = filterQuery.keyword;
      }
      if($scope.data.universe === 'zalando'){
        var countryFilter = _.get($scope.data, 'universeFilters.results[0]')||null;
        if(countryFilter && filterQuery.hasOwnProperty(countryFilter.key)) {
          baseFilter[countryFilter.key] = filterQuery[countryFilter.key];
        }
        if(filterQuery.hasOwnProperty('keyword')) baseFilter.keyword = filterQuery.keyword;
      }
    })
    .then(function(){
        return Product.filters($scope.data.universe, $scope.data.universe === 'zalando' ? filterQuery : filterQuery)
        .then(function(res) {
          // highlight filter selection in product-filter directive
          $scope.data.filter = $scope.data.universe === 'monotote' || $scope.data.universe === 'awin' ? res.query : filter || {};
          
          return $q.all(
              [
                !_.eq(baseFilter, filterQuery) ?
                Product.filters($scope.data.universe, baseFilter)
                .then(function(response){
                  return {
                    response: response
                  };
                })
                :
                {
                  response: res
                },
                {
                  response: res
                }
              ]
              .concat(
                _.keys(filterQuery)
                .filter(function(key){
                  if($scope.data.universe === 'zalando')
                  {
                    var countryFilter = _.get($scope.data, 'universeFilters.results[0]')||{key:''};
                    if(countryFilter.key === key) return false;
                    if(key === 'category') return false;
                  }
                  if($scope.data.universe === 'amazon')
                  {
                    if(/^department|browse-node$/.test(key)) return false;
                  }
                  if($scope.data.universe === 'monotote' || $scope.data.universe === 'awin')
                  {
                    if(/^category$/.test(key)) return false;
                  }
                  return !/^keyword$/.test(key);
                })
                .map(function(key){
                  var filter = angular.copy(filterQuery);
                  if(filter[key] == null)
                    return {key:null};
                  delete filter[key];
                  return Product.filters($scope.data.universe, filter)
                  .then(function(response){
                    response = _.find(response.results, function(filter){
                      return filter.key === key;
                    });
                    return {
                      key: key,
                      response: response 
                    };
                  });
                })
              )
            )
            .then(function(data){
              $scope.data.universeFilters = data[0].response;
              $scope.data.universeFilters.results = _.map($scope.data.universeFilters.results, function(filter){
                var filterInQuery = _.find(data, function(filterResponse){
                  return filter.key === filterResponse.key;
                });
                if(!filterInQuery)
                  filterInQuery = {
                    response: _.find(data[1].response.results, function(filterX){
                      return filterX.key === filter.key;
                    })
                  };
                switch(filter.key)
                {
                  case 'browse-node':
                  case 'category':
                  if($scope.data.universe !== 'zalando')
                  {
                      filter = filterInQuery.response || filter;
                      _.forEach(filter.facets, function(facet){
                          facet.count = 1;
                      });
                      break;
                  }
                  else return filter;
                  default:
                  if(filterInQuery.response)
                    _.forEach(filter.facets, function(facet){
                      var qFacet = _.find(filterInQuery.response.facets, function(facetX){
                        return (facetX.key||facetX.value)==(facet.key||facet.value);
                      });
                      facet.count = $scope.data.universe === 'monotote' || $scope.data.universe === 'awin' ? qFacet&&1||0 : qFacet&&qFacet.count||0;
                    });
                  else
                    _.forEach(filter.facets, function(facet){
                      facet.count = 0;
                    });
                }
                return filter;
              });
            });
        })
    })
    .catch(function(reason) {
      handleError(reason);
    })
    .then(function(){
      $scope.data.queryLoading--;
    });
  }

  function updatePager(data) {
      var pager = $scope.data.pager;
      var numPageItems = 7;

      if(data)
          pager.step = data.fetch_size;

      if (typeof pager.page !== 'undefined') {
          if (!pager.page) { pager.page = 1; }
          pager.start = pager.step * (pager.page - 1) + 1;
          pager.total = _.get(data, 'total_products', 0);
          pager.show = !!pager.total;
          pager.end = Math.min(pager.start + pager.step - 1, pager.total);
          pager.pages = [];
          for(var i = 0; i < numPageItems && (Math.max(pager.page-(numPageItems/2|0),1)+i) <= Math.ceil(pager.total / pager.step); i++)
            pager.pages.push((Math.max(pager.page-(numPageItems/2|0),1)+i));
      }
  }

  $scope.getProducts = function(inputProducts, showUnavailableOnly) {
      var products = [];
      _.each(inputProducts, function(product){
          if(!showUnavailableOnly || !product.disabled) {
              products.push(product);
          }
      })
      return products;
  };

  $scope.thumbnail = function(url) {
      return $sce.trustAsResourceUrl(typeof url === 'string' && url.length ? Thumbnail.size(url, 200) : SCT_CONFIG.defaultThumbnailImage);
  };

  $scope.quickSelect = function(universe, product) {
      $scope.$emit('product.select', product);
  };

  function setProduct(universe, data) {
      $scope.template = 'components/productBrowser/detail.html';
      $scope.data.queryKeywords = '';
      //$scope.data.keywords = [];
      $scope.data.product = data.product;
      $scope.data.productMeta = data.meta;
      $scope.data.universe = universe;
      $scope.data.productDetails = productDetails(data.meta);
      $scope.data.pager.show = false;
      // mirror API subproduct object structure allowing productConfiguration
      // to be used as filter on data.productMeta
      $scope.data.productConfiguration = {
          attributes: {
              color: $scope.data.productDetails.colors[0],
              size: $scope.data.productDetails.sizes[0]
          }
      };
      if (typeof $scope.data.productDetails.colors[0] === 'undefined') {
        delete $scope.data.productConfiguration.attributes.color;
      }
      if (typeof $scope.data.productDetails.sizes[0] === 'undefined') {
        delete $scope.data.productConfiguration.attributes.size;
      }
      $scope.data.productMeta && _.forEach($scope.data.productMeta, function(subProduct){
          subProduct.parent_sku = $scope.data.product.sku;
          subProduct.likes = $scope.data.product.likes;
      });
      $scope.data.product.parent_sku = $scope.data.product.sku; 
      $scope.data.productView = $scope.showSubProduct($scope.data.productConfiguration) || $scope.data.product;   // the product to display in product-quick-view directive
  }

  $scope.showProductDetail = function(universe, product) {
      clearProduct();
      scrollToTop();
      $scope.loadingProduct = true;
      Product.detail(product.sku)
      .then(function(res) {
          $scope.loadingProduct = false;
          
          if(res.disabled) {
             $scope.showProductDetailSection();
             return;
          }

          setProduct(universe, res);

          var urlSearch = angular.copy($location.search());
          urlSearch.screen = ProductBrowserUiScreenStates.VIEW_PRODUCT;
          urlSearch.universe = universe;
          urlSearch.sku = product.sku;
          $location.search(urlSearch);

          $scope.showProduct = true;
      })
      .catch(function(reason) {
        $scope.loadingProduct = false;
        handleError(reason);
      });
  };

  $scope.getQueryResult = function(universe) {
      if ($scope.data.queryHasResult) {
          return _.find($scope.data.queryResult, 'universe', universe);
      }
  };

  function filterCategories(categories, universes) {
    var result = {};
    // @TODO use cleaner iteration
    _.forEach(categories, function(v, k) {
      _.forEach(v, function(sub, subName) {
        _.forEach(universes, function(u, uName) {
          if (sub.hasOwnProperty(uName)) {
            _.set(result, uName + '.' + k + '.' + subName, sub[uName][0]); //.join('|')
          }
        });
      });
    });
    return result;
  }

  $scope.showUniverseCategory = function(universe, subcategory, data) {
    $location.search({
      screen: ProductBrowserUiScreenStates.UNIVERSE_SEARCH,
      category: data,
      universe: universe
    });
    clearProduct();
    Product.search(universe, { 'category': data })
    .then(function(res) {
      $scope.data.queryHasResult = false;
      $scope.data.queryResult = res.products;
      $scope.template = 'components/productBrowser/detail.html';
      $scope.data.filter = { 'category':  data };
      updatePager(res.page);
      onChangeUniverse(universe);
    })
    .catch(function(reason) {
      handleError(reason);
    });
  };

  $scope.pager = function(direction, value) {
    var pager = $scope.data.pager;
    if(direction === 'set') {
      if(value === pager.page) return;
      pager.page = value;
    }
    else
      pager.page =  direction === 'next' ? pager.page + 1 : Math.max(pager.page - 1, 0);
    $scope.$emit('product.filter.update',  null, {hideProductDetails:true});
  };

  function onDoSearch(evt, data) {
    $scope.data.universe = data.universe;
    $scope.data.keywords = data.keywords;
    $scope.data.filter = null;
    $scope.doSearch();
  }

  $scope.resetFilters = function(){
    onFilterUpdate(null, {}, true);
  };

  offProductSelected = $scope.$on('product.select', onProductSelected);
  offFilterUpdate = $scope.$on('product.filter.update', onFilterUpdate);
  offDoSearch = $scope.$on('product.doSearch', onDoSearch);
  offProductSearch = $scope.$on('product.search', function() {
      $scope.showProductDetailSection();
  });

  $scope.$on('$destroy', function () {
      offProductSelected();
      offFilterUpdate();
      offDoSearch();
      offProductSearch();
  });

});

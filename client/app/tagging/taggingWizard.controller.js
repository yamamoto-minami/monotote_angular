'use strict';

angular.module('app.tagging')
  .constant('TAGGING_TYPE', [
    { 'value': 'image', 'label': 'image' },
    { 'value': 'video', 'label': 'video' }
  ])
  .constant('ATTENTION_STATE', [
    { 'value': 1, 'label': 'Attention', 'name': 'attention' }
  ])
  .constant('TAGGING_STATE', [
    {'value':0, 'label': 'Inactive', 'name': 'inactive'},
    {'value':1, 'label': 'Active', 'name': 'active'},
    {'value':2, 'label': 'Paused', 'name': 'paused'},
    {'value':3, 'label': 'Draft', 'name': 'draft'}
  ])
  .constant('TAGGING_TYPES', [
    { type : 1, name: 'Simple', description: 'Just the icon.' },
    { type : 2, name: 'Price tag', description: 'Icon with product price.' },
    { type : 3, name: 'Full', description: 'Icon with product name and price.' }
  ])
  .factory('taggingWizardState', function(_) {
    var steps = [
      { name: 'select',  title: 'Select',   state: 'active'},
      { name: 'add',     title: 'Add Tags', state: 'hold'},
      { name: 'publish', title: 'Publish',  state: 'hold'}
    ];

    return {
      media: '',
      step: _.find(steps, 'state', 'active'),
      setActive: function(name) {
        var step = _.findIndex(steps, 'name', name);
        if (step === -1) {
          return false;
        }
        _.forEach(steps, function(n, k) {
          if (k < step) {
            n.state = 'completed';
          } else if (k === step) {
            n.state = 'active';
          } else {
            n.state = 'hold';
          }
        });
        this.step = steps[step];

        return this.step;
      },
      steps: function() {
        return steps;
      },
      setMedia: function(value) {
        _.find(steps, 'name', 'select').title = 'Select ' + value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
        this.media = value;
      },
      next: function() {
         return this.setActive(_.find(steps, 'state', 'hold').name);
      },
      peek: function() {
         return _.find(steps, 'state', 'hold').name;
      },
      hasNext: function() {
        return steps[steps.length-1].state !== 'active';
      },
      reset: function() {
          return this.setActive(_.first(steps).name);
      }
    };

  })
  .controller('TaggingWizardCtrl', function ($scope, taggingWizardState, SCT_CONFIG, Env, $upload,
    $window, videoService, Shoppable, Publisher, $rootScope, $state, $stateParams, TAGGING_DROPLETS, HotspotService,
    ngDialog, _, Auth, Product, $interval, $q, $sce, $location, $timeout, $document, $log, ShoppableItem) {

    $scope.formData = {};
    $scope.image = {};
    $scope.videoMeta = null;

    taggingWizardState.setMedia($state.current.media);

    $scope.steps = taggingWizardState.steps();
    $scope.state = taggingWizardState;

    $scope.isHTML5 = !!($window.File && $window.FormData);
    $scope.draggables = [{name:'product'}]; // ngDraggable seems to require ng-repeat for draggable elements
    $scope.hotspots = [];
    $scope.product = {};  // the selected product
    $scope.template = '';
    $scope.VideoService = videoService;
    $scope.shoppable = {};
    $scope.droplets = TAGGING_DROPLETS;
    var mode = 'new'; // new || edit;
    $scope.modeForm = 'new';
    $scope.pluginUrl = SCT_CONFIG.environments[Env].pluginUrl;
    $scope.loadingIndicatorTemplate = 'components/loader/loadingIndicator.html';
    var submitState = null;

    $scope.navToPlugin = function(){
      $location.path('/include-code');
    };

    function loadPluginScript(){
      var differed = $q.defer();

      function resolve() {
        differed.resolve($window.Monotote);
      }

      function hasMatch(){
        return ($window.Monotote)? true : false;
      }

      function onScriptLoad() {
        var checkExist = setInterval(function () {
          if ($window.Monotote) {
            clearInterval(checkExist);
            var Monotote = $window.Monotote;
            Monotote.ready(function () {
              resolve();
            });
          }
        }, 100);
      }

      function loadScript(path) {
        var el = $document[0].createElement("script"),
        loaded = false;
        $window._mnt.onReady = resolve;
        el.onload = el.onreadystatechange = function () {
          if ((el.readyState && el.readyState !== "complete" && el.readyState !== "loaded") || loaded) {
            return false;
          }
          el.onload = el.onreadystatechange = null;
          loaded = true;
        };
        el.async = true;
        el.id = 'sct-plugin';
        el.src = path;

        //el.src = path+'?cachebust='+Math.floor(Math.random() * (100000000 - 2)) + 2;

        $document[0].body.appendChild(el);
      }
      
      if (hasMatch())
        resolve();
      else
        loadScript(SCT_CONFIG.environments[Env].pluginUrl);
      
      return differed.promise;
    }

    function updateTemplate() {
      var step = taggingWizardState.step.name;
      $scope.template = 'app/tagging/template-' + step + (step !== 'publish' ? '-' + taggingWizardState.media : '') + '.html';
    }

    // try next wizard step
    // show error or use returned data
    function peekNext(step) {
        var deferred = $q.defer();
        if (step === 'add' && !$scope.shoppable.item_hash) { //only new
          Shoppable.save({
            title: $scope.formData.title,
            type: taggingWizardState.media,
            url: $scope.image.uri || $scope.formData.imageUrl || $scope.formData.videoUrl || '',
            icon_image: $scope.formData.imagePreviewUrl,
            icon_image2: $scope.formData.imagePreviewUrl2,
            icon_image3: $scope.formData.imagePreviewUrl3
          })
          .then(function(data) {
            $scope.shoppable = data;
            deferred.resolve();
          })
          .catch(function(reason) {
            var errorType = _.get(reason, 'status.error_type');
            if (errorType === 'validation_error') {
                $scope.error = _.get(reason, 'status.error_text');
            } else {
              $scope.error = reason;
            }
            deferred.reject();
          });
        } else if (step === 'publish' || step === 'add') { //edit or publish state.
          var data = {
            'shoppable': {
              'item': {
                  'title': $scope.formData.title,
                  'type': taggingWizardState.media,
                  'url': $scope.image.uri || $scope.formData.imageUrl || $scope.formData.videoUrl || '',
                  'icon_image': $scope.formData.imagePreviewUrl,
                  'icon_image2': $scope.formData.imagePreviewUrl2,
                  'icon_image3': $scope.formData.imagePreviewUrl3,
                  'status': 1
              },
              'detail' : {
                'products': _.map($scope.hotspots, function(hotspot) {
                    var result = {
                      'details': {
                        'sku': _.get(hotspot, 'product.sku', '')
                      },
                      'hotspots': {
                        'top': hotspot.position.top.replace('%',''),
                        'left': hotspot.position.left.replace('%',''),
                        'color': hotspot.color,
                        'type': hotspot.type
                      }
                    };

                    if (hotspot.hasOwnProperty('at')) {
                      result.hotspots.at = hotspot.at;
                    }
                    if (hotspot.hasOwnProperty('threshold')) {
                      result.hotspots.threshold = hotspot.threshold;
                    }

                    return result;
                })
              }
            }
          };

          //$log.debug(data);

          //remove any products that don't contain sku's
          data.shoppable.detail.products = _.map(data.shoppable.detail.products, function(product){
            if(product.details) {
              if (product.details.sku !== '') {
                return product; //only return on products that have sku's
              }
            }
          });

          //$log.debug(data);

          if (taggingWizardState.media === 'video') {
              data.shoppable.detail.banners = [];
              data.shoppable.detail.container = {
                  'title': $scope.formData.title,
                  'full_screen': 0
              };

          }

          //only call for publish step
          if (step === 'publish') {
            Shoppable.update($scope.shoppable.item_hash, data)
              .then(function () {
                deferred.resolve();
              })
              .catch(function (reason) {
                var errorType = _.get(reason, 'status.error_type');
                if (errorType === 'validation_error') {
                  $scope.error = _.get(reason, 'status.error_text');
                }
                deferred.reject();
              });
          }else{
            deferred.resolve();
          }

        } else {
            deferred.resolve();
        }

        var newShoppable = !$scope.shoppable.item_hash;
        return deferred.promise.then(function(){
          /*if(step === 'add' && taggingWizardState.media === 'image' && newShoppable) {
            $scope.detectProducts();
          }*/
        });
    }

    $scope.detectProducts = function detectProducts(){
      $scope.detectingProducts = true;
      $scope.autoTagFailed = false;
      var numberOfAddedProducts = 0;
      return Shoppable.detectProducts($scope.image.uri || $scope.formData.imageUrl)
      .then(function(body){
        $log.debug('visenze response', body);

        return $q.all(_.map(body.product_types, function(item, index){
          var box = item.box;
          var sku = body.group_result[index][0].value_map.SKU;
          if(!sku) return;
                
          var exists = !!_.find($scope.hotspots, function(hotspot){
            return hotspot.product && hotspot.product.sku === sku;
          });

          return !exists && Product.detail(sku)
          .then(function(data){
            if(data.product) {
              var hotspot = addHotspot($scope.droplets.slice(-1)[0], 
                (((box[2]-box[0])*0.5+box[0])/$scope.resourceWidth*100).toFixed(2) + '%', 
                (((box[3]-box[1])*0.5+box[1])/$scope.resourceHeight*100).toFixed(2) + '%');
              hotspot.product = {
                sku: _.get(data, 'product.sku'),
                name: _.get(data, 'product.name'),
                brand: _.get(data, 'product.partner_name'),
                price: _.get(data, 'product.price'),
                special_price: _.get(data, 'product.special_price'),
                currency: _.get(data, 'product.currency')
              };
              numberOfAddedProducts++;
            }
          })
        }));
      })
      .then(function(){
        $scope.detectingProducts = false;
      }, function(){
        $scope.detectingProducts = false;
      })
      .then(function(){
        if(numberOfAddedProducts === 0) {
          $scope.autoTagFailed = true;
        }
      })
    }

    $scope.onDragComplete = function(droplet, evt) {
        evt.moved = true;
    };

    $scope.onDropComplete = function(droplet, evt) {
      var target, x, y, bounds, hotspot;
      target = $(evt.dropTarget).get(0);

      // calc hotspot postion
      bounds = target.getBoundingClientRect();

      x = evt.x - window.pageXOffset - bounds.left;
      y = evt.y - window.pageYOffset - bounds.top;

      if (droplet.hasOwnProperty('id')) {
        if (!evt.moved) { return; }
        droplet.position = calculatePosition(x, y, bounds);
        droplet.dirty = true; // dirty droplets will be redrawn by directive
      } else {
          hotspot = angular.extend({
            id: _.uniqueId(),
            product: null,
            position: calculatePosition(x, y, bounds),
            media: taggingWizardState.media,
            dirty: true
          }, droplet);

          if (taggingWizardState.media === 'video') {
            hotspot.at = videoService.current;
            hotspot.threshold = 1;
          }

          // add hotspot to collection
          $scope.hotspots.push(hotspot);
          HotspotService.active(hotspot);
      }
    };

    // convert position in px to %
    var calculatePosition = function(left, top, bb){
      return {
        left: ((left / bb.width) * 100).toFixed(2) + '%',
        top: ((top / bb.height) * 100).toFixed(2) + '%'
      };
    };

    $scope.save = function(type){
      /* Types
      0 = inactive
      1 = active
      2 = paused
      3 = concept
      */
      var iconImages = [];
      
      var data = {
        'shoppable': {
          'item': {
              'title': $scope.formData.title,
              'type': taggingWizardState.media,
              'url': $scope.image.uri || $scope.formData.imageUrl || $scope.formData.videoUrl || '',
              'icon_image': $scope.formData.imagePreviewUrl,
              'icon_image2': $scope.formData.imagePreviewUrl2,
              'icon_image3': $scope.formData.imagePreviewUrl3,
              'status': type
          },
          'detail' : {
            'products': _.map($scope.hotspots, function(hotspot) {
                var result = {
                  'details': {
                    'sku': _.get(hotspot, 'product.sku', '')
                  },
                  'hotspots': {
                    'top': hotspot.position.top.replace('%',''),
                    'left': hotspot.position.left.replace('%',''),
                    'color': hotspot.color,
                    'type': hotspot.type
                  }
                };

                if (hotspot.hasOwnProperty('at')) {
                  result.hotspots.at = hotspot.at;
                }
                if (hotspot.hasOwnProperty('threshold')) {
                  result.hotspots.threshold = hotspot.threshold;
                }

                return result;
            })
          }
        }
      };
      
      Shoppable.update($scope.shoppable.item_hash, data)
        .then(function () {
            $state.go('tagging.list');
        })
        .catch(function (reason) {
          var errorType = _.get(reason, 'status.error_type');
          if (errorType === 'validation_error') {
            $scope.error = _.get(reason, 'status.error_text');
          }
          $state.go('tagging.list');
        });
    };

    // try next wizard step
    // set template if response resolves
    // errors and data is handled by peekNext
    $scope.next = function(form) {
      if (Object.keys(form.$error).length === 0 && taggingWizardState.hasNext()) {
        if (submitState !== null) { return; }
        // try next step, if API endpoint return 200 goto next step
        $scope.error = null;
        $scope.submitState = 'progress';
        peekNext(taggingWizardState.peek())
        .then(function() {
          submitState = null;
          taggingWizardState.next();
          updateTemplate();
          $state.go('tagging.existing-'+$state.current.media, {targetStep: taggingWizardState.step.name, shoppable: $scope.shoppable.item_hash}, {notify:false})
          pluginAvoidIframeEditable();
          pluginLoad();
          if ($scope.hotspots.length === 0){
            $timeout(function() {
              $scope.$broadcast('edittag');
            },500);
          }
        });
      } else {
        $scope.close();
        return false;
      }
    };

    function addHotspot(droplet, x, y){

      var hotspot = angular.extend({
        id: _.uniqueId(),
        product: null,
        position: {
          left: x,
          top: y
        },
        media: taggingWizardState.media,
        dirty: true
      }, droplet);

      if (taggingWizardState.media === 'video') {
        hotspot.at = videoService.current;
        hotspot.threshold = 1;
      }

      // add hotspot to collection
      $scope.hotspots.push(hotspot);

      return hotspot;
    }

    function pluginAvoidIframeEditable()
    {
        if(taggingWizardState.media === 'video' && taggingWizardState.step.name !== 'publish'){
            //look for iframe and add mnt-processed="true" so we don't process the video during edit
            var checkIframe = setInterval(function () {
              var elem = $document[0].querySelector('iframe.app-video-element');
              if(elem){
                clearInterval(checkIframe);
                angular.element(elem).attr( 'mnt-processed', 'true' );
              }
            }, 100);
        }
    }

    function pluginLoad()
    {
        if(taggingWizardState.step.name === 'publish') {
            loadPluginScript().then(function(Monotote){
                getPublishPreviewProducts()
                .then(function(products){
                    Monotote.setFeed(products, {});
                    angular.element('.sct-detail-panel').show();
                })
            });
        }
    }
    
    function getPublishPreviewProducts()
    {
        return Shoppable.get({
          'item-hash': $scope.shoppable.item_hash
        })
        .then(function(shoppable){
            return $q.resolve()
            .then(function(){
                shoppable.item.item_hash = shoppable.item.hash;
                shoppable.item.company_hash = "";
                shoppable.item.detail = shoppable.detail;
                shoppable.detail.container.title = shoppable.item.title;
            })
            .then(function(){
                return $q.all(_.map(shoppable.item.detail.products, function(item){
                    return Product.detail(item.details.sku)
                    .then(function(res) {
                        item.details = _.get(res, 'product');
                        if(item.details)
                        {
                            item.details.brand = _.get(res, 'product.partner_name');
                            item.details.currency = _.get(res, 'product._site.currency');
                            item.details.type = item.hotspots.type;
                        }
                    })
                    .catch(function(err){
                        _.pull(shoppable.item.detail.products, item);
                        errorHandler(err);
                    })
                }));
            })
            .then(function(){
                return [shoppable];
            })
        });
    }

    $scope.cancel = function() {
        var itemHash = $scope.shoppable.item_hash;
        if (mode === 'new' && itemHash) {
            Shoppable.delete(itemHash)
            .then(function() {
                $state.go('tagging.list');
            })
            .catch(errorHandler);
        } else {
            $state.go('tagging.list');
        }
    };

    $scope.close = function() {
      if($window.Monotote){
        $window.Monotote.reset();
        angular.element('.sct-detail-panel').hide();
      }
      if ($rootScope.routerPrevState && $rootScope.routerPrevState.name) {
        $state.go($rootScope.routerPrevState);
      } else {
        $state.go(SCT_CONFIG.defaultRoute);
      }
    };

    // for ng-file-drop
    $scope.$watch('formData.file', function () {
      $scope.upload($scope.formData.file);
    });

    $scope.upload = function(files) {
      var file;
      if (files && files.length === 1) {
        $scope.image.file = file = files[0];
        uploadReset();
        $upload.upload({
          url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.shoppablesUpload,
          file: file,
          fileFormDataName: 'image',
          api: true
        })
        .success(uploadSuccess);
      }
    };

    function uploadReset() {
      $scope.image.progress = 0;
    }

    function uploadSuccess(data, status) {
      if (status === 200) {
          if (_.has(data, 'body.url')) {
            $scope.image.uri = data.body.url;
            $scope.formData.imageUrl = data.body.url;
          } else {
            $scope.image.error = 'Image upload failed';
          }
      } else {
          $scope.image.error = 'Image upload failed';
      }
    }

    function reset() {
      taggingWizardState.reset();
    }

    $scope.videoSrc = function() {
      return $scope.formData.videoUrl || '';
    };

    $scope.imageSrc = function() {
      return $scope.image && $scope.image.uri || $scope.formData.imageUrl || '';
    };

    $scope.hasImage = function() {
      var img = $scope.image && $scope.image.uri || $scope.formData.imageUrl;
      return typeof img === 'string' && img.length;
    };

    $scope.onShoppableFrameLoadSuccess = function(width, height){
      if(!$scope.resourceIsReady) {
        $scope.resourceWidth = width;
        $scope.resourceHeight = height;
        $log.debug($scope.resourceWidth, $scope.resourceHeight);
      }
      $scope.resourceIsReady = true;
    };

    $scope.onShoppableFrameLoadError = function(){
      $scope.resourceIsReady = true;
      $scope.frameSourceLoadFailed = true;
    };

    // used in combination with ng-clip to copy publish step code example to clipboard
    $scope.copyExampleCodeToClipboard = function(name) {
      return angular.element('[data-code="' + name + '"]').text();
    };

    // only show brand in product views if available
    $scope.hasBrand = function(product) {
      return product && product._source && product._source.partner_name !== '';
    };

    $scope.openInProductBrowser = function(sku){
      
      var currentStateName = $state.current.name,
          currentParams = angular.copy($state.params);

      $state.go('productBrowser', {

      }, {notify:false});

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

      var offWatchParentClose = $scope.$on('$destroy', function(){
        productBrowser.close();
      });

      productBrowser.closePromise
      .then(function (data) {
        offWatchParentClose();
        $state.current.name !== 'login' && $state.go(currentStateName, currentParams, {notify: false});
        if (data.value && data.value.product) {
          currentHotspot.product = {
            sku: _.get(data.value, 'product.sku'),
            name: _.get(data.value, 'product.name'),
            brand: _.get(data.value, 'product.partner_name'),
            price: _.get(data.value, 'product.price'),
            special_price: _.get(data.value, 'product.special_price'),
            currency: _.get(data.value, 'product.currency')
          };
          hotspotToggleShowAttentionsOnly($scope.hotspotShowAttentionsOnly);
        }
      });
    };

    $scope.showProductBrowser = function(evt) {
        evt && evt.preventDefault(); // stop button from submitting form
        var currentHotspot = HotspotService.active();
        if (!currentHotspot) {
          return;
        }

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
            currentParams = angular.copy($state.params);
        $state.go('productBrowser', {}, {notify:false});

        var offWatchParentClose = $scope.$on('$destroy', function(){
            productBrowser.close();
        });

        productBrowser.closePromise
        .then(function (data) {
            offWatchParentClose();
            $state.current.name !== 'login' && $state.go(currentStateName, currentParams, {notify: false});
            if (data.value && data.value.product) {
            currentHotspot.product = {
                sku: _.get(data.value, 'product.sku'),
                name: _.get(data.value, 'product.name'),
                brand: _.get(data.value, 'product.partner_name'),
                price: _.get(data.value, 'product.price'),
                special_price: _.get(data.value, 'product.special_price'),
                currency: _.get(data.value, 'product.currency')
            };
            hotspotToggleShowAttentionsOnly($scope.hotspotShowAttentionsOnly);
          }
        });
    };

    function editableShoppable(shoppable) {
        return {
            'item_hash': _.get(shoppable, 'item.hash'),
            'container_id': _.get(shoppable, 'item.detail.container.container_id')
        };
    }

    function fetchHotspotDetails(hotspots) {
        var promises = [];
        _.map(hotspots, function(hotspot) {
           // add hotspot product details
           if (!_.get(hotspot, 'product.sku')) {
             hotspot.product.notFound = true;
             return;
           }
           promises.push(Product.detail(hotspot.product.sku)
           .then(function(res) {
              hotspot.product = {
                  notFound: false,
                  disabled: _.get(res, 'product.disabled'),
                  affiliate: _.get(res, 'product.affiliate'),
                  sku: _.get(res, 'product.sku'),
                  name: _.get(res, 'product.name'),
                  brand: _.get(res, 'product.partner_name'),
                  price: _.get(res, 'product.price'),
                  special_price: _.get(res, 'product.special_price'),
                  currency: _.get(res, 'product.currency'),
                  attention: (_.get(res, 'product.active') === 0 || _.get(res, 'product.out_of_stock') === 1)
              };
           })
           .catch(function(err){
             hotspot.product.notFound = true;
             errorHandler(err);
           }));
        });
        return $q.all(promises);
    }

    function setFormDataFromShoppable(shoppable) {
       var f = $scope.formData;
       var s = shoppable.item;

       f.title = s.title;
       if (s.type === 'video') {
           $scope.formData.videoUrl = s.url;
       } else {
           $scope.formData.imageUrl = s.url;
       }

       //populate imagePreviewUrl
       f.imagePreviewUrl = s.icon_image;
       f.imagePreviewUrl2 = s.icon_image2;
       f.imagePreviewUrl3 = s.icon_image3;

       if (shoppable.detail.products) {
           $scope.hotspots = _.map(shoppable.detail.products, function(item) {
              var val = {
                'id': _.uniqueId(),
                'product': {
                    sku: item.details.sku
                },
                'position':{
                    'left': item.hotspots.left + '%',
                    'top': item.hotspots.top + '%'
                },
                'media': s.type,
                'color': item.hotspots.color,
                'type': item.hotspots.type
              };

              if (item.hotspots.hasOwnProperty('at')) {
                val.at = item.hotspots.at;
              }
              if (item.hotspots.hasOwnProperty('threshold')) {
                val.threshold = item.hotspots.threshold;
                // temp fix because API resets to 0
                // @TODO remove after API fix
                if (val.threshold === 0) { val.threshold = 1; }
              }
              return val;
           });
       }
    }

    function errorHandler(reason) {
        console.warn(reason);
    }

    $scope.$watch('formData.videoUrl',function(newVal,oldVal){
      var tmpUrl, startIdx, endIdx, quoteType;
      if(!newVal) return;
      if(newVal !== oldVal && newVal.toLowerCase().indexOf('iframe')>-1){
        startIdx = newVal.toLowerCase().indexOf('src=')+4;// +4 for the number of characters
        quoteType = newVal.substr(startIdx, 1);
        if(!/(\"|\')/.test(quoteType)){
          quoteType = ' ';
          startIdx = startIdx-1;
        }
        tmpUrl = newVal.substr(startIdx+1);
        endIdx = tmpUrl.indexOf(quoteType);
        tmpUrl = tmpUrl.substr(0, endIdx);
        $scope.formData.videoUrl = tmpUrl;
      }
      $scope.videoProviderConfig = videoService.detectProvider(newVal) || {};
    });

    $scope.deleteHotspot = function(evt) {
        evt.preventDefault();

        if (!$scope.activeHotspot) { return; }

        var hotspot = $scope.activeHotspot;
        $scope.deselect();

        if (hotspot) {
            $scope.hotspots.splice( $scope.hotspots.indexOf(hotspot), 1 );
        }
    };

    $scope.deleteShoppable = function(evt, shoppable) {
        evt.preventDefault();
        var itemHash = shoppable.item_hash;
        var confirmDelete = ngDialog.openConfirm({
            templateUrl: 'components/modal/confirm.html',
            overlay: true,
            disableAnimation: true,
            controller: ['$scope', function(scope) {
                scope.message = 'Are you sure?';
            }]
        });
        confirmDelete.then(function() {
            Shoppable.delete(itemHash)
            .then(function() {
                $state.go('tagging.list');
            })
            .catch(errorHandler);
        });
    };

    $scope.deselect = function() {
      $scope.activeHotspot = null;
      HotspotService.active(null);
    };

    $scope.$on('player.setProgress', function(evt, timeAsPrecent) {
      if ($scope.activeHotspot) {
        $scope.activeHotspot.at = timeAsPrecent;
      }
    });
    /*
    $scope.$on('youtube.player.ready', function(event, player) {
        var meta = $scope.videoMetaData = player.getVideoData();
        var retry;
        // author metadata seems to be added at a later point
        // try for a few seconds to get author name
        if (typeof meta.author === 'string' && !meta.author.length) {
            retry = $interval(function() {
                meta = player.getVideoData();
                if (meta.author.length) {
                    $scope.videoMetaData = meta;
                    $interval.cancel(retry);
                }
            }, 250, 5);
        }
    });
    */

    $scope.$on('hotspot.select', function(evt, hotspot) {
      $scope.activeHotspot = hotspot;
      $scope.$broadcast('edittag');
    });

    $scope.$on('hotspot.edit', function() {
      // show 'edit tag' tab when item is selected in 'all tags'
      $scope.$broadcast('edittag');
    });
    
    $scope.hotspotToggleShowAttentionsOnly = hotspotToggleShowAttentionsOnly;
    $scope.hotspotShowAttentionsOnly = false;
    $scope.hotspotAttentionExists = false;
    
    $scope.$watch('hotspots', hotspotFilter, true);
    
    function hotspotToggleShowAttentionsOnly(enable)
    {
      $scope.hotspotShowAttentionsOnly = enable == null ? !$scope.hotspotShowAttentionsOnly : !!enable;
      hotspotFilter($scope.hotspots);
      if(!$scope.hotspotAttentionExists && $scope.hotspotShowAttentionsOnly && $scope.hotspots.length)
      {
        hotspotToggleShowAttentionsOnly(false);
      } 
    }
    
    function hotspotFilter(arr)
    {
      arr = angular.isArray(arr)&&arr||[];
      $scope.filteredHotspots = arr
      .filter(function(item){
        return $scope.hotspotShowAttentionsOnly ? !item.product || item.product.notFound || item.product.disabled : true;
      });
      $scope.hotspotAttentionExists = arr
      .some(function(item){
        return !item.product || item.product.notFound || item.product.disabled;
      }); 
    }

    reset();
    updateTemplate();

    Shoppable.detectAvailability()
    .then(function(data){
      var brands = Object.keys(data).map(function(x){
        return data[x];
      });
      
      $scope.detectBrandAvailability = [brands.slice(0, brands.length-1).join(', '), brands.slice(-1)[0]].filter(function(x){
        return x;
      }).join(' and ');
      
    })

    Publisher.profile()
    .then(function(data){
      $scope.enableAutoTagging = data.permissions.auto_tagging == null || !!data.permissions.auto_tagging;
    })

    // edit existing shoppable
    if (ShoppableItem.shoppable) {
      Shoppable.get({
        "item-hash": ShoppableItem.shoppable
      })
      .then(function(shoppable){
        mode = 'edit';
        $scope.modeForm = 'edit';
        $scope.shoppable = editableShoppable(shoppable);
        setFormDataFromShoppable(shoppable);
        ShoppableItem.targetStep && taggingWizardState.setActive(ShoppableItem.targetStep);
        updateTemplate();
        pluginAvoidIframeEditable();
        pluginLoad();
        if ($scope.hotspots.length === 0){
          $timeout(function() {
            $scope.$broadcast('edittag');
          },500);
        }
      })
      .then(function(){
        return fetchHotspotDetails($scope.hotspots);
      })
      .then(function(){
        ShoppableItem.tagsListMode === 'attentions' && hotspotToggleShowAttentionsOnly(true);
      })
      /*.then(function(){
        if($state.params.hotspotId)
        {
          var hotspot = _.find($scope.hotspots, function(item){
            return item.id === $state.params.hotspotId;
          })
          if(hotspot) {
            HotspotService.active(hotspot);
            $scope.showProductBrowser(null, true);
          }
        }
      })*/;
    }

  });


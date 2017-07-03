'use strict';

angular.module('appSCT', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ngDialog',
  'angular-clipboard',
  'angularFileUpload',
  'ngDraggable',
  'cmp.youtube',
  'cmp.html5player',
  'ngClipboard',
  'ngNumeraljs',
  'angularUtils.directives.dirPagination',
  'cmp.envConfig',
  'cmp.config',
  'cmp.shoppableView',
  'cmp.shoppable',
  'cmp.rangeSlider',
  'cmp.product',
  'cmp.productView',
  'cmp.productFilter',
  'cmp.moment',
  'cmp.lodash',
  'cmp.hotspotListView',
  'cmp.hotspotView',
  'cmp.publisher',
  'cmp.auth',
  'cmp.translations',
  'cmp.siteHeader',
  'cmp.siteFooter',
  'cmp.input',
  'cmp.tabpane',
  'cmp.hotspot',
  'cmp.productBrowser',
  'cmp.thumbnail',
  'cmp.slider',
  'cmp.fallback',
  'cmp.order',
  'cmp.watch',
  'cmp.screen-change-css-watch',
  'cmp.customImg',
  'cmp.getCountries',
  'cmp.itemSelect',
  'cmp.pseudoFocus',
  'cmp.removeFocus',
  'cmp.currencies',
  'cmp.affiliate',
  'cmp.tour',
  'cmp.retailer',
  'cmp.copy2clipboard',
  'cmp.pageLeaveLock',
  'cmp.googleAnalytics',
  'cmp.pluginJack',
  'cmp.notification',
  'cmp.theme-management',
  'cmp.resourceLoadCallbacks',
  'cmp.zopimChat',
  'app.login',
  'app.signup',
  'app.reset-forgotten-password',
  'app.tagging',
  'app.themes',
  'app.products',
  'app.analytics',
  'app.orders',
  'app.includecode',
  'app.profile',
  'app.productBrowser',
  'app.generatelink',
  'app.confirmation',
  'app.test',
  'app.tour',
  'app.retailers',
  'app.main'
])
.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath('vendor/zeroclipboard/dist/ZeroClipboard.swf');
}])
.config(function ($logProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $translateProvider, Env) {

  if(Env==='prod'||Env==='stage'){
    $logProvider.debugEnabled(false);
  }

  $urlRouterProvider.otherwise('/tagging/list');

  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('authInterceptor');
  $translateProvider.preferredLanguage('en');
})
.constant('_', window._) // allow DI for use of lodash in controllers, unit tests
.factory('authInterceptor', function($log,$rootScope, $q, $cookieStore, $location, $window, $injector, _) {

  function logoutUser(){
    if($location.path()!=='/login'){
      $cookieStore.remove('ac');
      $rootScope.$broadcast('user.unset');
      $location.path('/login');
    }
  }

  return {
    // add authorization token to headers
    request: function(config) {
      var _ac = $cookieStore.get('ac');
      if (config.api && config.api === true) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + _ac;
      }
      $log.debug(config);
      return config;
    },

    response: function(response) {
      if(/^application\/json/.test(response.headers('Content-Type'))) {
        if(response.data && typeof(response.data) === 'object' && response.data.status && response.data.status.code !== 200) {
          if(response.data.status.code === 401){
            logoutUser();
            return $q.reject(response)
          }
        }  
      }
      
      return $q.resolve(response);
    },

    // Intercept 401s and redirect to login
    responseError: function(response) {
      if (response.status === 401) {
        logoutUser();
        return $q.reject(response)
      } else if (response.status === 500 || response.status === -1) {
        $log.debug(response);
        //ToDo: temporary fix for API server not trapping session timeout
        $injector.get('Notification').error("Something went wrong while trying to connect to the API. Please try again later.")
        return $q.reject(response);
      } else {
        var errorType = _.get(response, 'data.status.error_type');
        if (_.get(response, 'config.ignore') === response.status) {
            $log.error(response);
        } else if (_.indexOf(['coming_soon', 'validation_error'], errorType) === -1) {
            $log.error(response);
            var text = 'REST API response: \n\n';
            text = text + _.get(response, 'data.status.error_text');
            if (_.has(response, 'data.status')) {
                text = text + JSON.stringify(response.data.status);
            }
            text = text + '\n\nREST API endpoint:';
            text = text + '\n\n' + _.get(response, 'config.method') + ' ' + _.get(response, 'config.url') + '\n\n';
            text = text + _.get(response, 'status') + ' ' + _.get(response, 'statusText') + '\n\n';
            $log.error(text);
        }
        return $q.reject(response);
      }
    }

  };
})
.run(function($rootScope, $location, $log, Auth, $cookieStore, $window, navMenu, GoogleAnalyticsService, _) {
  // check authentication on state change
  $rootScope.$on('$stateChangeStart', function(evt, next, toParams, fromState) {
    // store router state to allow a controller to go back to that state
    if (next.keepRouterPrevState && next.keepRouterPrevState === true) {
      $rootScope.routerPrevState = fromState.name.length ?  fromState.name : next.name;
    }

    Auth.isLoggedInAsync(function(loggedIn) {
      if (next.authenticate && !loggedIn) {
        $location.path('/login');
      }
      else {
        var stateConfig = _.find(navMenu, function(conf){
          return conf.sref === next.name;
        });
        if(stateConfig && stateConfig.permission)
          Auth.getCurrentUser()
          .then(function(currentUser){
            if(!currentUser.permissions[stateConfig.permission])
              $location.path('/');
          })
      }
    });

    if($window.Monotote){
      $window.Monotote.reset();
      if(angular.element('.sct-detail-panel')){
        angular.element('.sct-detail-panel').hide();
      }
    }
    
  });

  $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState) {
    $rootScope.currentRouteState = toState;
    $rootScope.pageViewport.modalStack = 0;
    $rootScope.$global.navMenu && ($rootScope.$global.navMenu.visible = null);
  })

  $rootScope.$on('$locationChangeSuccess', function(){
    if (!$window.ga)
      return;
    $log.debug('GoogleAnalytics: sending a page view:',  $location.url());
    $window.ga('send', 'pageview', { page: $location.url() });
  })

  $rootScope.$on('user.set', function(){
    GoogleAnalyticsService.setDimension('dimension1', Auth.getIdentity()['user-hash']);
  })

  $rootScope.$on('user.unset', function(){
    GoogleAnalyticsService.setDimension('dimension1', '');
  })

  $rootScope.$global = {};
  
  $rootScope.pageViewport = {
    zoom: 1,
    modalStack: 0
  };


  $rootScope.toggleHideScrollbars = function(bool) {
    if(bool) {
      $rootScope.pageViewport.modalStack++;
    } else if (bool != null) {
      $rootScope.pageViewport.modalStack--;
    }
  }

  var documentPositionLeft, documentPositionTop, $hideScrollbarsStyle;

  $rootScope.$watch('pageViewport.modalStack', function(val, prev){
    if(val > 0) {
      if(prev === 0) {
        documentPositionLeft = $window.pageXOffset || $window.document.documentElement.scrollLeft || $window.document.body.scrollLeft || 0;
        documentPositionTop = $window.pageYOffset || $window.document.documentElement.scrollTop || $window.document.body.scrollTop || 0;
        angular.element($window.document.body).addClass('app-disable-scroll');
        $hideScrollbarsStyle = angular.element('<style>').text('body.app-disable-scroll { position: fixed !important; left: ' + -documentPositionLeft + 'px !important; top: ' + -documentPositionTop + 'px !important; right: 0 !important; bottom: 0 !important; }').appendTo('body');
      }
    } else if (prev > 0) {
      $hideScrollbarsStyle.remove();
      $hideScrollbarsStyle = null;
      angular.element($window.document.body).removeClass('app-disable-scroll');
      $window.scrollTo(documentPositionLeft, documentPositionTop);
      documentPositionLeft = null;
      documentPositionTop = null;
    } else if (val < 0) {
      $rootScope.pageViewport.modalStack = 0;
    }
  })
  
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test($window.navigator.userAgent))
  {
    var windowScreen = $window.screen.height < $window.screen.width ? $window.screen.height : $window.screen.width;
	  var minScreen = 440;
		var ratio = windowScreen / minScreen;
	  if(windowScreen < minScreen)
		{
		  $rootScope.pageViewport.zoom = ratio;
	  }
  }
});


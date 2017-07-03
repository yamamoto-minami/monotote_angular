'use strict';

angular.module('app.tagging', ['cmp.hotspotPanel'])
  .config(function ($stateProvider) {

    var resolveObjects = {
      ShoppableItem: ResolveStateParams
    };

    $stateProvider
      .state('tagging', {
        url: '/tagging',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('tagging.list', {
        url: '/list',
        templateUrl: 'app/tagging/tagging-list.html',
        controller: 'TaggingCtrl',
        authenticate: true
      })
      .state('tagging.image', {
        url: '/image/',
        templateUrl: 'app/tagging/tagging-wizard.html',
        controller: 'TaggingWizardCtrl',
        authenticate: true,
        supportLink: 'https://support.monotote.com/hc/en-us/articles/214173425',
        keepRouterPrevState: true,
        media: 'image',
        resolve: resolveObjects
      })
      .state('tagging.video', {
        url: '/video/',
        templateUrl: 'app/tagging/tagging-wizard.html',
        controller: 'TaggingWizardCtrl',
        authenticate: true,
        supportLink: 'https://support.monotote.com/hc/en-us/articles/214173565', 
        keepRouterPrevState: true,
        media: 'video',
        resolve: resolveObjects
      })
      .state('tagging.existing-image', {
        url: '/image/:shoppable/:targetStep/',
        templateUrl: 'app/tagging/tagging-wizard.html',
        controller: 'TaggingWizardCtrl',
        authenticate: true,
        supportLink: 'https://support.monotote.com/hc/en-us/articles/214173425',
        keepRouterPrevState: true,
        media: 'image',
        params: {
          targetStep: 'select',
          tagsListMode: 'all'
        },
        resolve: resolveObjects
      })
      .state('tagging.existing-video', {
        url: '/video/:shoppable/:targetStep/',
        templateUrl: 'app/tagging/tagging-wizard.html',
        controller: 'TaggingWizardCtrl',
        authenticate: true,
        supportLink: 'https://support.monotote.com/hc/en-us/articles/214173565', 
        keepRouterPrevState: true,
        media: 'video',
        params: {
          targetStep: 'select',
          tagsListMode: 'all'
        },
        resolve: resolveObjects
      });

    

    ResolveStateParams.$inject = ['$state','$stateParams'];
    function ResolveStateParams($state,$stateParams) {
      return $stateParams;
    }
  });


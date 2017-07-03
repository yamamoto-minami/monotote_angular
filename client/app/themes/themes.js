'use strict';

angular.module('app.themes', ['cmp.hotspotPanel','cmp.colorPicker'])
  .config(function ($stateProvider) {

    $stateProvider
      .state('themes', {
        url: '/themes',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('themes.list', {
        url: '/list',
        templateUrl: 'app/themes/themes-list.html',
        controller: 'ThemesCtrl',
        authenticate: true
      })
      .state('themes.designer', {
        url: '/designer/:themeID',
        templateUrl: 'app/themes/themes-designer.html',
        controller: 'themesDesignerCtrl',
        authenticate: true,
        params: {
          fork: false
        }
      })
      .state('themes.preview', {
        url: '/editor-preview',
        templateUrl: 'app/themes/preview.html',
        authenticate: true
      });
  });


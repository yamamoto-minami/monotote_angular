'use strict';

angular.module('cmp.siteHeader')
.directive('siteHeader', function($window,$timeout) {
  return {
    templateUrl: 'components/header/header.html',
    restrict: 'E',
    controller: 'SiteHeaderCtrl',
    link: function(scope, element, attrs) {
      var win = angular.element($window);
      var navElement = element.find('nav .nav-header__list_dynamic').get(0);
      var supportButtonElement = $window.document.getElementById('menu_item_support');
      win.on('resize', onResize);
      var updateNavUI = setInterval(onResize,200);

      scope.scrollLeft = scroll.bind(this, -1);
      scope.scrollRight = scroll.bind(this, 1);
      scope.getSupportButtonRect = getSupportButtonRect;

      scope.$on('$destroy', function(){
        win.off('resize', onResize);
        clearInterval(updateNavUI);
      })

      function getSupportButtonRect() {
        return supportButtonElement.getBoundingClientRect();
      }

      function scroll(direction) {
        angular.element(navElement).animate({scrollLeft: navElement.scrollLeft+direction*navElement.offsetWidth*0.75});
      }

      function onResize(){
        element.toggleClass('navmenu-show-right-scrollbar', navElement.scrollWidth - 20 > navElement.clientWidth + navElement.scrollLeft);
        element.toggleClass('navmenu-show-left-scrollbar', navElement.scrollLeft > 0 && navElement.scrollWidth > navElement.clientWidth);
      }
    }
  };
});

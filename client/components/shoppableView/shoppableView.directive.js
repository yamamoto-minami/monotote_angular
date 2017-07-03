'use strict';

angular.module('cmp.shoppableView', [])
.directive('shoppableView', function factory(TAGGING_STATE, ATTENTION_STATE, Thumbnail, SCT_CONFIG, _) {
  return {
      templateUrl: 'components/shoppableView/shoppableView.html',
      restrict: 'E',
      replace: true,
      link: function(scope, $element) {

        function getShoppableState(shoppable) {
          return _.find(TAGGING_STATE, { 'value': shoppable.item.status });
        }

        scope.getShoppableState = getShoppableState;

        scope.stateLabel = function(shoppable) {
          if (!shoppable) { return; }
          var state = getShoppableState(shoppable);
          return state ? state.label : '';
        };

        scope.stateClass = function(shoppable) {
          if (!shoppable) { return; }
          var state = getShoppableState(shoppable);
          return state ? 'badge--' + state.name : '';
        };

        scope.iconClass = function(shoppable) {
          if (!shoppable) { return; }
          return shoppable.item.type ? 'icon-' + shoppable.item.type : '';
        };

        scope.thumbnail = function(shoppable) {
          if (!shoppable) { return; }
          var url = shoppable.item.thumbnail;
          return typeof url === 'string' && url.length ? Thumbnail.size(url, 250, 250, true) : SCT_CONFIG.defaultThumbnailImage;
        };

        scope.select = function($event, shoppable, targetStep, toggleShowAttentionsOnly) {
          if($event.isDefaultPrevented()) return;
          $event.preventDefault();
          scope.$emit('shoppable.select', shoppable, targetStep, toggleShowAttentionsOnly);
        };
        scope.deleteShoppable = function($event, shoppable) {
          $event.stopPropagation();
          scope.$emit('shoppable.delete', shoppable);
        };

        scope.productActionCount = function(shoppable) {
          if (!shoppable) { return; }
          var attnCount = _.filter(shoppable.item.detail.products, function(prod){
            return prod.details.status === 0;
          });
          return attnCount.length;
        };

        scope.productLikeCount = function(shoppable) {
          if (!shoppable) { return; }
          var sum = 0;
          _.each(shoppable.item.likes, function(value){
            sum += value;
          });
          return sum;
        };

        scope.hotspotCount = function(shoppable) {
            if (!shoppable) { return; }
            var hotspots = _.get(shoppable, 'item.detail.products');
            return hotspots ? hotspots.length : 0;
        };

      }
  };
});

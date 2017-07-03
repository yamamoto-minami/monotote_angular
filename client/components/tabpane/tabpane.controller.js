'use strict';

angular.module('cmp.tabpane', [])
.controller('tabpaneCtrl', function tabCtrl($scope,$state,$sce) {
  var panes = $scope.panes = [];

  $scope.select = function(pane) {
    if (typeof pane.enabled !== 'undefined' && !pane.enabled) {
        return;
    }
    angular.forEach(panes, function(pane) {
      pane.selected = false;
    });
    pane.selected = true;

    if($scope.callback){
      $scope.callback({'heading': pane.heading});
    }
  };

  $scope.switchToPane = function(pane, $event) {
    if(!pane.uiState) {
      $event.preventDefault();
      $scope.select(pane);
    }
    // if ui pane has uiState, ui-router will take care that for us
  }

  $scope.getClass = function(suffix, selected) {
    var cls = $scope.prefix + suffix;
    return selected ?  cls + ' ' + cls + '--active' : cls;
  };

  $scope.$on('edittag', function() {
    $scope.select(panes[1]);
  });

  this.addPane = function(pane, attrs) {
    if ($state.current.tabpane == null) {
      panes.length === 0 && $scope.select(pane);
    }
    else {
      $state.current.tabpane === attrs.id && $scope.select(pane);
    }
    pane.uiState = attrs.tabUiState;
    pane.uiStateHRef = pane.uiState && $state.href(pane.uiState, $state.params);
    panes.push(pane);
  };

});

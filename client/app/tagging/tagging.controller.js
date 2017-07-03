'use strict';

angular.module('app.tagging')
.controller('TaggingCtrl', function ($scope, $q, $timeout, Shoppable, RetailerService, Notification, ATTENTION_STATE, TAGGING_STATE, TAGGING_TYPE, $state, ngDialog, $location, Auth, _) {

  // state filter, add default 'All' option for view
  $scope.shoppable_status = {};
  $scope.statusLabels = {
    'all': 'All',
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'attention': 'Attention',
    'paused': 'Paused'
  };
  // sort order filter values
  $scope.sortby = [
    { 'value': 'updated', 'label': 'Date', 'order' : true, 'arrow_asc': 'up', 'arrow_desc': 'down2'},
    { 'value': 'title', 'label': 'Name', 'order' : true, 'arrow_asc': 'down2', 'arrow_desc': 'up'}
  ];

  $scope.users = null;
  $scope.loadingShoppables = true;
  var searchToken = null, searchTimer = null;
  var numPageItems = 4;

  // selected filter values
  $scope.filter = {
    status: null,
    sort: $scope.sortby[0],
    types: angular.fromJson(angular.toJson(TAGGING_TYPE)),
    order: false,
    type: null,
    user: null,
  };

  $scope.toggleOrder = toggleOrder;

  // shoppables paging
  $scope.currentPage = 1;
  
  $scope.setPage = function(page){
    $scope.currentPage = page;
    if(searchTimer != null) {
      $timeout.cancel(searchTimer);
      searchTimer = null;
    }
    searchToken = Date.now();
    getShoppables()
    .then(onShoppablesData, function(){
      $scope.loadingShoppables = false;
    });
  };

  $scope.getShoppables = function(){
    $scope.setPage(1);
  };

  $scope.$on('shoppable.select', function(evt, shoppable, targetStep, toggleShowAttentionsOnly) {
    $state.go('tagging.existing-' + (shoppable.item.type === 'video'? 'video': 'image'),
      {
        shoppable: shoppable.item.hash,
        targetStep: targetStep || null,
        tagsListMode: toggleShowAttentionsOnly ? 'attentions' : 'all'
      },
      { reload: true }
    );
  });

  $scope.$on('shoppable.delete', function(evt, shoppable) {
    evt.preventDefault();
    var itemHash = shoppable.item.hash;
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
        //remove from list
        $scope.setPage($scope.currentPage);
      });
    });
  });

  function toggleOrder(item) {
    $scope.filter.order = $scope.filter.sort === item ? !$scope.filter.order : true;
    $scope.filter.sort = item;
  }

  function onShoppablesData(data){
    return $q.resolve()
    .then(function(){
      if(!data) { return; }
      if(data.shoppable.length === 0 && $scope.currentPage > 1) {
        return $scope.setPage($scope.currentPage-1);
      }
      $scope.shoppables = data.shoppable;

      $scope.shoppablesMeta = data.meta;

      if(data.meta.shoppable_status) {
        $scope.shoppable_status = angular.extend({
          //all: null
        }, data.meta.shoppable_status);
      }

      if(!$scope.shoppablesMetaFirstLoad) {
        $scope.shoppablesMetaFirstLoad = $scope.shoppablesMeta;
      }

      if(data.meta.users) {
        $scope.users = data.meta.users;
        $scope.users.forEach(function(user){
          user.name = [user.first_name, user.last_name].join(' ');
          user.sortByName = [user.last_name, user.first_name].join(', ');
        })

        $scope.users.sort(function(a,b){
          return a.sortByName.localeCompare(b.sortByName);
        })
      }
      if(data.meta.shoppable_stats) {
        data.meta.stats = {};
        _.forEach(TAGGING_STATE, function(state) {
          state = angular.fromJson(angular.toJson(state));
          state.value = data.meta.shoppable_stats[state.name];
          data.meta.stats[state.name] = state;
        });
        _.forEach(ATTENTION_STATE, function(attention) {
          attention = angular.fromJson(angular.toJson(attention));
          attention.value = data.meta.shoppable_stats[attention.name];
          data.meta.stats[attention.name] = attention;
        })
      }

      $scope.range && $scope.shoppablesMeta.current_page === 1 && Notification.primary({
        positionX: 'center',
        message: 'Found ' + $scope.shoppablesMeta.total_items + ' item(s)'
      });

      $scope.range = {
        total: $scope.shoppablesMeta.total_items,
        lower: ($scope.shoppablesMeta.current_page-1) * data.input.records_per_page + 1,
        upper: ($scope.shoppablesMeta.current_page-1) * data.input.records_per_page + $scope.shoppables.length
      };

      $scope.pagination = {
        current: $scope.shoppablesMeta.current_page,
        last: Math.ceil($scope.shoppablesMeta.total_items/data.input.records_per_page),
        pages: []
      };

      for(var i = 0; i < numPageItems && (Math.max($scope.pagination.current-(numPageItems/2|0),1)+i) <= $scope.pagination.last; i++)
        $scope.pagination.pages.push((Math.max($scope.pagination.current-(numPageItems/2|0),1)+i));
    })
    .finally(function(){
      $scope.loadingShoppables = false;
    })
  }
    

  function getShoppables(){
    // get shoppables
      $scope.loadingShoppables = true;
      return Shoppable.get({
        //cached: true
        search: $scope.filter.search,
        status: $scope.filter.status,
        sortBy: $scope.filter.sort.value,
        sortOrder: $scope.filter.order^$scope.filter.sort.order ? 'desc' : 'asc',
        page: $scope.currentPage,
        records_per_page: 12,
        user: $scope.filter.user || undefined,
        type: $scope.filter.type
      });
  }

  //call on page load
  Auth.getCurrentUser()
  .then(function(profile){
    $scope.filter.user = profile.user.user_hash;
    
    $scope.$watchGroup(['filter.status','filter.type','filter.sort.value','filter.order','filter.search','filter.types','filter.user'], function(){
      $scope.currentPage = 1;
      var currentToken = searchToken = Date.now();
      if(searchTimer != null) $timeout.cancel(searchTimer);
      searchTimer = $timeout(function(){
        searchTimer = null;
        getShoppables()
        .then(function(data){
          if(searchToken !== currentToken) return;
          onShoppablesData(data);
        }, function(){
          $scope.loadingShoppables = false;
        });
      }, 200)
    });
  })

});

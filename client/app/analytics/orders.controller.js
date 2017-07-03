'use strict';

angular.module('app.orders')
  .controller('OrdersCtrl', function ($scope, $state, $stateParams, $filter, $window, SCT_CONFIG, Env, Order) {
    $scope.sort={
      column:$stateParams.sort,
      asc:$stateParams.ascending==='true'
    };
    var moment = $window.moment;
    var config = SCT_CONFIG;
    var dateformat = 'YYYY-MM-DD';

    $scope.pageWidth = {width: '' + ($window.screen.availWidth - 40) + 'px'};
    $scope.displayDateFormat = config.dateformat_long;

    // set up column sort function
    $scope.sortOrder=function(column){
      if($scope.sort.column === column){
        $scope.sort.asc = !$scope.sort.asc;
      }else{
        $scope.sort.asc = true;
        $scope.sort.column = column;
      }
      $scope.updateSortOrder();
      $state.go($state.current.name, {
        sort: $scope.sort.column,
        ascending: $scope.sort.asc
      }, {notify: false});
    };

    $scope.updateSortOrder=function() {
        if($scope.sort.column && $scope.orders)
        {
          var column = $scope.sort.column;
          switch(column)
          {
            case 'price_total':
            case 'price_shipping_cost':
              column+='__number';
          }
          $scope.orders = $filter('orderBy')($scope.orders, column, !$scope.sort.asc);
        }
    };

    $scope.setFromDate = function() {
        var attr = $scope.filters.selected;
        attr['start-date'] = moment($scope.fromDatePicker._d).format(dateformat);
        // update to date if needed
        if (moment(attr['start-date']).isAfter(attr['end-date'])) {
          attr['end-date'] = moment(attr['start-date']).add(1, 'days').format(dateformat);
        }
    };

    $scope.setToDate = function() {
        var attr = $scope.filters.selected;
        attr['end-date'] = moment($scope.toDatePicker._d).format(dateformat);
        // update from date if needed
        if (moment(attr['end-date']).isBefore(attr['start-date'])) {
          attr['start-date'] = moment(attr['end-date']).subtract(1, 'days').format(dateformat);
          $scope.fromDatePicker.setDate(asDate(attr['start-date']));
        }
    };

    // return Date object from momentJS object
    // @param {String} a day formated as dateformat
    // @param {Number} optional value to mutate the date value (use negatice value to subtract)
    // @param {String} optional value to mutate by (days, weeks, ...)
    function asDate(date, amount, key) {
        if (typeof amount !== 'undefined') {
          key = key || 'days';
          return moment(date, dateformat).add(amount, key).toDate();
        } else {
          return moment(date, dateformat).toDate();
        }
    }

    $scope.getFromDate = function() {
      var dp = $scope.fromDatePicker;
      dp.setDate($scope.attributes.from);
      dp.setMinDate(new Date(config.mindate));
      dp.setMaxDate(new Date($scope.attributes.to));
    };

    $scope.getToDate = function() {
      var dp = $scope.toDatePicker;
      dp.setDate($scope.attributes.to);
      dp.setMinDate(new Date($scope.attributes.from));
      dp.setMaxDate(new Date());
    };

    $scope.thumbnail = function(sku) {
      return sku ? SCT_CONFIG.environments[Env].imageUrl + sku + '/0?mw=100&mh=80' : '/img/assets/0.jpeg';
    };

    $scope.open = function(sku){
      angular.element(sku).css('display','block');
    };

    $scope.border = function(len){
      return (len>1)?{'border-bottom':'1px solid #999'}:null;
    };

    var findListedItemIndex = function(haystack, needle, key){
        key = key || 'id';
        for(var i=0;i<haystack.length;i++){
            if(haystack[i][key]===needle){
                return i;
            }
        }
    };

    $scope.toggleSelection = function(retailer){
      var idx = $scope.filters.selected.retailers.indexOf(retailer.name);

      if (idx > -1) { // is currently selected
        $scope.filters.selected.retailers.splice(idx, 1);
      } else {// is newly selected
        $scope.filters.selected.retailers.push(retailer.name);
      }
    };

    $scope.updateDates = function(){
      if($scope.filters.selected.period==='c'){return;}
      var idx = findListedItemIndex($scope.filters.available.periods,$scope.filters.selected.period,'name');

      $scope.filters.selected['start-date'] = $scope.filters.available.periods[idx].range.start;
      $scope.filters.selected['end-date'] = $scope.filters.available.periods[idx].range.end;

    };

    $scope.download = function(type){
      Order.download($scope.downloads[type])
        .then(function(response){
          $window.location = response.data.body.url;
        });
    };

    var fetch = function(options) {
      Order.get(options)
        .then(function(data) {
          $scope.filters = $scope.filters || data.body.filters;
          $scope.headers = data.body.output.shift();
          $scope.orders = data.body.output;
          $scope.downloads = data.body.download;
          // init pikaday datepicker
          $scope.$watch('fromDatePicker', function(dp) {
            if (dp) {
              dp.setDate(moment($scope.filters.selected['start-date'], dateformat).toDate());
              dp.setMaxDate(moment($scope.filters.selected['end-date'], dateformat).toDate());
            }
          });

        })
        .then(function(){
          // ensure some column values are numbers
          angular.forEach($scope.orders, function(order){ 
            order.price_total__number = order.price_total*1;
            order.price_shipping_cost__number = order.price_shipping_cost*1;
          });
        })
        .then(function(){
          $scope.updateSortOrder();
        });
    };
    
    $scope.post = function(){
      //var options = $scope.filters.selected;
      //fetch(options);
      $state.go($state.current.name, $scope.filters.selected, {reload:true});
    };

    $scope.queryParams = angular.extend({}, $stateParams);
    delete $scope.queryParams.sort;
    delete $scope.queryParams.ascending;
    if(!$scope.queryParams.period && $scope.queryParams['start-date'] && $scope.queryParams['end-date'])
    {
        $scope.queryParams.period = 'c';
    }
    
    fetch(Object.keys($scope.queryParams)
    .filter(function(x){
      return !!$scope.queryParams[x];
    }).length ? $scope.queryParams : null);


  })
  .config(['pikadayConfigProvider', function(pikaday) {
    pikaday.setConfig({
      format: 'YYYY-MM-DD'
    });
  }]);

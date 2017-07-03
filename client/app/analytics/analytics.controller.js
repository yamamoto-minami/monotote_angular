'use strict';

angular.module('app.analytics')
  .controller('AnalyticsCtrl', function ($scope, Mixpanel, $window, SCT_CONFIG, _, $state, $stateParams) {
    $scope.segmentation = [];
    $scope.emptySegmentData = false;
    $scope.segmentQuery = true;
    $scope.revenue = {
      userCount: 0,
      paidCount: 0,
      paidAverage: 0,
      total: 0
    };
    $scope.sort={
      column:'products',
      asc:true
    };
    var moment = $window.moment;
    var config = SCT_CONFIG;
    var dateformat = 'YYYY-MM-DD';

    var lastMonth = function() {
      return moment(moment().startOf('month').subtract(1, 'month').toDate()).format(dateformat);
    };
    var today = function() {
      return moment(new Date()).format(dateformat);
    };

    $scope.hideUnitSelector = function(heading){
      $scope.unitSelectorShown = false;//(heading==='Segmentation');
      if(heading==='Orders'){
        $state.go('ordersReport');
      }
    };

    //set defaults
    $scope.attributes = {
      from: $stateParams['start-date']||lastMonth(),
      to: $stateParams['end-date']||today(),
      unit: $stateParams.unit||'day',
      type: $stateParams.type||'general',
      events: [],   // all event names
      event: null,  // single event name
      eventDetail: null
    };

    $scope.fromDatePickerFirstBoot = false;

    // init pikaday datepicker
    $scope.$watch('fromDatePicker', function(dp) {
      if (dp) {
        $scope.fromDatePickerFirstBoot = true;
        dp.setDate(moment($scope.attributes.from, dateformat).toDate());
        dp.setMaxDate(moment($scope.attributes.to, dateformat).subtract(1, 'days').toDate());
      }
    });

    // update data if from, to or event value has changed
    /*$scope.$watchGroup(['attributes.from', 'attributes.to', 'attributes.event', 'attributes.unit'], function (newValue, oldValue) {
        if (newValue === oldValue || moment($scope.attributes.to).isBefore($scope.attributes.from)) {
          return;
        }

        fetch();
    }, true);
    */
    // set up column sort function
    $scope.sortOrder=function(column){
      if($scope.sort.column === column){
        $scope.sort.asc = !$scope.sort.asc;
      }else{
        $scope.sort.asc = true;
        $scope.sort.column = column;
      }
    };

    $scope.setFromDate = function() {
        if($scope.fromDatePickerFirstBoot) {
          $scope.fromDatePickerFirstBoot = false;
          return;
        }
        var attr = $scope.attributes;
        var from_date = moment($scope.fromDatePicker._d).format(dateformat);
        var to_date = attr.to;
        // update to date if needed
        if (moment(from_date).isAfter(to_date)) {
          to_date = moment(from_date).add(1, 'days').format(dateformat);
        }
        $state.go($state.current.name, {
          'start-date': from_date,
          'end-date': to_date
        });
    };

    $scope.setToDate = function() {
        var attr = $scope.attributes;
        var to_date = moment($scope.toDatePicker._d).format(dateformat);
        var from_date = attr.from;
        // update from date if needed
        if (moment(to_date).isBefore(from_date)) {
          from_date = moment(to_date).subtract(1, 'days').format(dateformat);
          //$scope.fromDatePicker.setDate(asDate(attr.from));
        }
        $state.go($state.current.name, {
          'start-date': from_date,
          'end-date': to_date
        });
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

    $scope.displayDateFormat = config.dateformat_long;

    var fetch = function() {
      var attr = angular.copy($scope.attributes);
      var opt = {
        from_date: moment(attr.from).format(dateformat),
        to_date: moment(attr.to).format(dateformat),
        unit: attr.unit,
        type: attr.type
      };
      $scope.segmentQuery = true;

      if (attr.events.length) {
        getEventData(opt,attr.events);
        getRevenueData(opt);
      } else {
        getEventNames(opt);
      }

    };

    var getRevenueData = function(opt){
      var key, userCount = 0, paidCount = 0, paidAvg = 0, total = 0, returnArr = [], product = {};
      Mixpanel.getRevenueData(opt)
      .then(function(data) {
        data = data.results;
        //by products so lets loop through the results
        for (key in data) {
          //calculate totals by each product
          if (data[key].hasOwnProperty('$overall')) {
            userCount += data[key].$overall.count;
            paidCount += data[key].$overall.paid_count;
            paidAvg += ((data[key].$overall.amount / data[key].$overall.paid_count) || 0);
            total += data[key].$overall.amount;
          }
          // push object into array object for the view

          product.name = key==='undefined'?'unknown':key;
          product.customer_count = data[key].$overall.count;
          product.paid_count = data[key].$overall.paid_count;
          product.amount = Math.round(data[key].$overall.amount * 100)/100;
          product.paid_avg = Math.round(((data[key].$overall.amount / data[key].$overall.paid_count) || 0) * 100)/100;
          product.user_avg = Math.round(((data[key].$overall.amount / data[key].$overall.count) || 0) * 100)/100;
          returnArr.push(product);
        }
        $scope.revenueData = returnArr;
        $scope.revenue.payingUsers = paidCount;
        $scope.revenue.userCount = userCount;
        $scope.revenue.paidCount = Math.round(paidCount * 100)/100;
        $scope.revenue.paidAverage = Math.round(paidAvg * 100)/100;
        $scope.revenue.total = Math.round(total * 100)/100;
      });
    };

    var getEventNames = function(opt){
      Mixpanel.getEventNames()
      .then(function(events) {
        $scope.attributes.events = events;
        getRevenueData(opt);
        return getEventData(opt,events.data);
      });
    };

    var getEventData = function(opt,events){
      Mixpanel.getEventData(_.defaults({}, opt, { event: events}))
      .then(function(eventDetail) {
        $scope.segmentQuery = false;
        $scope.attributes.eventDetail = eventDetail.data;
        if (eventDetail.hasOwnProperty('data')) {
          $scope.segmentation = transform($scope.attributes.eventDetail.data);
          $scope.emptySegmentData = !eventDetail.data.legend_size;
        }
      });
    };

    // transform segment data for graph rendering
    var transform = function(data) {
      var result = [];
      _.forEach(data.series, function(date) {
        var d = {};
        d.date = date;
        result.push(d);
        _.forEach(data.values, function(v,k) {
            d[k] = v[date];
        });
      });

      return result;
    };

    fetch();

  })
  .config(['pikadayConfigProvider', function(pikaday) {
    pikaday.setConfig({
      format: 'YYYY-MM-DD'
    });
  }]);

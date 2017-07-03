'use strict';

angular.module('cmp.mixpanel')

  .directive('segmentationChart', function ($q, $window, D3, $timeout, $interval, $log, $state, $stateParams, _) {
    return {
      templateUrl: 'components/mixpanel/segmentationChart.html',
      replace: true,
      restrict: 'EA',
      scope: {
        data: '=',
        from: '=',
        to: '=',
        unit: '='
      },
      link: function (scope, element, attributes) {

        var margin,
          barHeight,
          barPadding,
          d3,
          svgElement,
          svgContainer,
          dateformat = 'YYYY-MM-DD',
          initialize,
          options;

        options = {
          height: 440,
          minWidth: 200
        };

        scope.loadEvents = true;
        scope.selectedEventNames = {};
        
        function clear() {
          svgContainer().empty();
          svgElement = null;
        }

        function render() {
          if (!d3.version || !scope.data) {
            return;
          }

          var data, dateDiffInDays, tickUnit, margin, width, height, x, y,
            color, xAxis, yAxis, line, svg, event, loadData, mouseover, mouseout;

          data = scope.data;
          dateDiffInDays = (moment(scope.to, dateformat).toDate() - moment(scope.from, dateformat).toDate()) / 86400000;
          // if date range is larger than 60 days display y axis labels every n weeks else every n days
          tickUnit = dateDiffInDays > 60 ? d3.time.week : d3.time.day;
          margin = {top: 20, right: 40, bottom: 30, left: 40};
          width = Math.max(options.minWidth, svgContainer().width()) - margin.left - margin.right;
          height = options.height - margin.top - margin.bottom;
          x = d3.time.scale().range([0, width]);
          y = d3.scale.linear().range([height, 0]);
          color = d3.scale.category10();
          xAxis = d3.svg.axis()
            .scale(x)
            .ticks(tickUnit, Math.min(5, Math.ceil(dateDiffInDays / 15)))
            .tickFormat(d3.time.format('%b %d'))
            .orient('bottom');
          yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width)
            .orient('left');

          line = d3.svg.line()
            .interpolate('linear')
            .x(function (d) {
              return x(d.date);
            })
            .y(function (d) {
              return y(d.value);
            });

          svg = d3.select(svgContainer()[0]).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('id', 'graph-transform')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
          svgElement = svg.node();

          color.domain(d3.keys(data[0]).filter(function (key) {
            return key !== 'date';
          }));

          data.forEach(function (d) {
            d.date = new Date(d.date);
          });

          scope.events = color.domain().map(function (name, idx) {
            return {
              name: name,
              id: 'graph-idx-' + idx,
              color: color(name),
              values: data.map(function (d) {
                return {date: d.date, value: +d[name]};
              })
            };
          });

          loadData = function(){
            x.domain(d3.extent(data, function (d) {
              return d.date;
            }));
            y.domain([
              d3.min(scope.selectedEvents, function (c) {
                return d3.min(c.values, function (v) {
                  return v.value;
                });
              }),
              // multiply by 1.1 to give extra space on top of graph
              d3.max(scope.selectedEvents, function (c) {
                return d3.max(c.values, function (v) {
                  return v.value * 1.1;
                });
              })
            ]);

            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + height + ')')
              .call(xAxis);

            svg.append('g')
              .attr('class', 'y axis')
              .call(yAxis)
              .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'end');

            event = svg.selectAll('.event')
              .data(scope.selectedEvents)
              .enter().append('g')
              .attr('class', 'event')
              .attr('data-color', function (d) {
                return color(d.name);
              })
              .attr('data-name', function (d) {
                return d.name;
              })
              .attr('data-item', function (d) {
                return d.id;
              });

            event.append('path')
              .attr('class', 'line')
              .attr('d', function (d) {
                return line(d.values);
              })
              .style('stroke', function (d) {
                return color(d.name);
              });

            mouseover = function () {
              var $dot = d3.select(this),
                data = this.__data__,
                item = $dot.attr('data-item');

              scope.$apply(function () {
                scope.item = {
                  title: $dot.attr('data-name'),
                  date: data.date,
                  value: data.value
                };
              });
              // display data point info
              showInfo(this, color($dot.attr('data-name')));

              // highlight active data
              focus(item, $dot);
            };

            mouseout = function () {
              // remove data caption
              hideInfo();
              // remove data highlight
              unfocus();
            };

            _.forEach(scope.selectedEvents, function (item) {
              svg.selectAll('.dott')
                .data(item.values)
                .enter().append('circle')
                .on('mouseover', mouseover)
                .on('mouseout', mouseout)
                .attr('cx', function (d) {
                  return x(d.date);
                })
                .attr('cy', function (d) {
                  return y(d.value);
                })
                .attr('r', 5)
                .attr('class', 'dot')
                .attr('data-value', function (d) {
                  return d.value;
                })
                .attr('data-name', item.name)
                .attr('data-item', item.id)
                .style('fill', function () {
                  return color(item.name);
                });
            });

          };

          if(scope.loadEvents){
            scope.loadEvents = false; //only the first time
            $timeout(function(){
              scope.selectedEvents = [];
              loadData();
            },1000);
          }else{
            if(scope.selectedEvents){
              if(scope.selectedEvents.length===0){
                clear();
              }else{
                loadData();
              }
            }else{
              scope.selectedEvents = [];
              clear();
            }

          }
        }

        /* jshint ignore:start */
        function focus(name, dot) {
          var activeEvent, eventList, dotList, sel,
            animationDuration = 150;

          // higlight transitions
          sel = '[data-item="' + name + '"]';
          activeEvent = d3.select('.event' + sel);
          eventList = d3.selectAll('.event:not(' + sel + ')');
          dotList = d3.selectAll('.dot:not(' + sel + ')');

          // @TODO move animation parameters to module attributes
          eventList.transition().duration(animationDuration).style('opacity', 0.25);
          dotList.style('stroke-width', 0);
          dotList.transition().duration(animationDuration).style('opacity', 0.5).attr('r', 3);
          activeEvent.select('.line').transition().duration(animationDuration).style('stroke-width', 4);

          if (dot) {
            dot.transition().duration(animationDuration).attr('r', 10).style('opacity', 1);
          }
        }

        /* jshint ignore:end */
        function getScreenCoords(x, y, ctm) {
          var xn = ctm.e + x * ctm.a;
          var yn = ctm.f + y * ctm.d;
          return {x: xn, y: yn};
        }

        function showInfo(elm, color) {

          var dataInfo2 = $('.graph-datapoint-info', element);
          var offset = $(elm).offset();
          var pos = getScreenCoords(elm.getAttribute('cx'), elm.getAttribute('cy'), elm.getCTM());

          dataInfo2.css({
            left: pos.x,
            top: pos.y,
            borderColor: color
          }).addClass('jShow');

          if (dataInfo2.outerWidth() + offset.left + 50 > svgContainer().outerWidth()) {
            dataInfo2.css('left', pos.x - dataInfo2.outerWidth() - 50);
          }

          // title color
          $('.spec-title', dataInfo2).css('color', color);
        }

        function hideInfo() {
          $('.graph-datapoint-info', element).removeClass('jShow');
        }

        function unfocus() {
          var eventList, dotList, cnt,
            animationDuration = 450;

          // transitions to remove higlights
          cnt = d3.select(svgContainer()[0]);
          eventList = cnt.selectAll('.event');
          dotList = cnt.selectAll('.dot');

          eventList.transition().duration(animationDuration).style('opacity', 1);
          eventList.select('.line').transition().duration(animationDuration).style('stroke-width', 1.25);
          dotList.style('stroke-width', 2);
          dotList.transition().duration(animationDuration).style('opacity', 1).attr('r', 5);
        }

        svgContainer = function () {
          return $('.graph-canvas', element);
        };

        initialize = function (_d3) {
          d3 = _d3;
          margin = parseInt(attributes.margin) || 20;
          barHeight = parseInt(attributes.barHeight) || 20;
          barPadding = parseInt(attributes.barPadding) || 5;

          render();
        };

        scope.updateChart = function (updateUrl) {
          scope.selectedEvents = scope.events.filter(function(item){
            return scope.selectedEventNames[item.id];
          });
          if(updateUrl)
            $state.go($state.current.name, {
              f: scope.selectedEvents.map(function(x){
                return x.id;
              })
            }, {notify:false});
          clear();
          render();
        };

        // re-render on window width change
        $window.onresize = function () {
          scope.$apply();
          clear();
          render();
        };

        scope.$watch('data', function (newVal) {
          if (newVal && newVal.length){
            clear();
            render();
          }
        });

        D3.then(initialize)
        .then(function(){
          return $q(function(resolve){
            $timeout(resolve, 2000);
          });
        })
        .then(function(){
          if($stateParams.f) {
            return $q(function(resolve){
              var waitTimer = $interval(function(){
                if(scope.events)
                {
                  $interval.cancel(waitTimer);
                  resolve();
                }
              },100);
            })
            .then(function(){
              (angular.isArray($stateParams.f) ? $stateParams.f : [$stateParams.f])
              .forEach(function(x){
                scope.selectedEventNames[x] = true;
              });
              scope.updateChart();
            })
          }
        });
      }
    };
  });

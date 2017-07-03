'use strict';

angular.module('cmp.hotspotView')
  .directive('hotspotView', function (videoService, HotspotService,$sce) {
    return {
      templateUrl: 'components/hotspotView/hotspotView.html',
      replace: true,
      restrict: 'E',
      controller: 'hotspotViewCtrl',
      link: function (scope, element) {
        scope.state = 'default';
        var colorClass,
            typeClass,
            update,
            toggle;

        if (scope.hotspot) {

          scope.renderHtml = function(html_code){
              return $sce.trustAsHtml(html_code);
          };

          if (!scope.hotspot.hasOwnProperty('position')) {
            scope.hotspot.position = {
                left: '50%',
                top: '50%'
            };
          }

          if (!scope.hotspot.hasOwnProperty('color')) {
              scope.hotspot.color = 1;
          }

          if (!scope.hotspot.hasOwnProperty('type')) {
              scope.hotspot.type = 1;
          }

          update = function(isDirty) {
            if (!isDirty) { return; }

            // update position
            element.css({
              left: scope.hotspot.position.left,
              top: scope.hotspot.position.top
            });

            if (colorClass) {
                element.removeClass(colorClass);
            }

            // update color
            colorClass = 'droplet--' + scope.hotspot.color;
            element.addClass(colorClass);

            if (typeClass) {
                element.removeClass(typeClass);
            }

            // update type
            typeClass = 'droplet-type--' + scope.hotspot.type;
            element.addClass(typeClass);

            // cleanup
            scope.hotspot.dirty = false;
          };

          if (scope.hotspot.position) {
            element.css({
              position: 'absolute',
              cursor: 'pointer'
            });
          }

          // update hotspot
          scope.$watch('hotspot.dirty', update);

          scope.active = scope.hotspot.dirty || false;
          // call update on init
          update(true);


          // TODO merge with update function
          // hotspot with time value
          if (typeof scope.hotspot.at !== 'undefined') {

            // show or hide on hotspot
            toggle = function() {
              var timeDiff = parseFloat(videoService.current) - parseFloat(scope.hotspot.at);
              var active = HotspotService.active();
              // keep showing active hotspot
              if (active && scope.hotspot.id === active.id) {
                if (scope.state !== 'on') {
                  angular.element(element).show();
                  scope.state = 'on';
                }
                return;
              }

              if (timeDiff >= 0 && timeDiff <= scope.hotspot.threshold) {
                angular.element(element).show();
                scope.state = 'on';
              } else if (scope.state === 'on' || scope.state === 'default') {
                angular.element(element).hide();
                scope.state = 'off';
              }
            };


            // show or hide on hotspot time value update
            scope.$watch('hotspot.at', toggle);

            // show or hide on video player progress
            scope.$watch('VideoService.current', toggle);

            // show or hide on hotspot threshold value update
            scope.$watch('hotspot.threshold', toggle);


          }

        }

      }
    };
  });

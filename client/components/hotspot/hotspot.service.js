'use strict';

angular.module('cmp.hotspot', [])
.factory('HotspotService', function($rootScope) {
    var activeHotspot;

    return {
        active: function(hotspot) {
            if (typeof hotspot !== 'undefined') {
                // hotspot already selected
                if (hotspot !== null && activeHotspot && hotspot.id === activeHotspot.id) {
                    return;
                }

                // deselect current hotspot
                if (activeHotspot) {
                    $rootScope.$broadcast('hotspot.deselect', activeHotspot);
                }

                activeHotspot = hotspot;
                if (hotspot !== null) {
                  $rootScope.$broadcast('hotspot.select', hotspot);
                }
            } else {
                return activeHotspot;
            }
        }
    };

});

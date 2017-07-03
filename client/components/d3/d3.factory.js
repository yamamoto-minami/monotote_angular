'use strict';

angular.module('cmp.d3', [])
  .factory('D3',['$window', '$document', '$q', '$rootScope', '$timeout', 'SCT_CONFIG',
    function($window, $document, $q, $rootScope, $timeout, SCT_CONFIG) {


      var deffered = $q.defer();

      function resolve() {
        deffered.resolve($window.d3);
      }

      function hasMatch(){
        return ($window.d3)? true : false;
      }

      if (hasMatch()) {
        resolve();
      }

      function onScriptLoad() {
        $rootScope.$apply(resolve);
      }

      function loadApi(url) {
        var tag = $document[0].createElement('script');
        tag.src = url;
        tag.onreadystatechange = function () {
          if (this.readyState === 'complete') {
            $timeout(onScriptLoad());
          }
        };

        tag.onload = function() {
          $timeout(onScriptLoad);
        };

        var firstScriptTag = $document[0].getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      loadApi(SCT_CONFIG.d3Url);

      return deffered.promise;
    }
]);

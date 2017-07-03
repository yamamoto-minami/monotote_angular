'use strict';

angular.module('cmp.md5', [])
  .factory('md5',['$window', '$document', '$q', '$rootScope', '$timeout', 'SCT_CONFIG',
    function($window, $document, $q, $rootScope, $timeout, SCT_CONFIG) {

      var deffered = $q.defer();

      function resolve() {
        deffered.resolve($window.md5);
      }

      function hasMatch(){
        return ($window.md5)? true : false;
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

      loadApi(SCT_CONFIG.md5Url);

      return deffered.promise;
  }
]);

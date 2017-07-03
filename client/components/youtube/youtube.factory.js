'use strict';

angular.module('cmp.youtube')
.factory('youtubeFactory', ['$document', '$q', '$rootScope', '$window', function($document, $q, $rootScope, $window){

	var deffered = $q.defer();

  // adapted from http://stackoverflow.com/a/5831191/1614967
  var youtubeRegexp = /^https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*$/i;

	function resolve() {
    deffered.resolve($window.YT);
	}

  function hasMatch(){
    return ($window.YT && $window.YT.loaded)? true : false; // undocumented check
  }

  if (hasMatch()) {
	  resolve();
  }

  // The onYouTubeIframeAPIReady function will execute as soon as the player API code downloads.
  $window.onYouTubeIframeAPIReady = function(){
    resolve();
  };

  function loadApi() {
    var tag = $document[0].createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = $document[0].getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  function contains(str, substr) {
      return (str.indexOf(substr) > -1);
  }

  function getIdFromURL(url) {
      var id = url.replace(youtubeRegexp, '$1');

      if (contains(id, ';')) {
          var pieces = id.split(';');

          if (contains(pieces[1], '%')) {
              // links like this:
              // "http://www.youtube.com/attribution_link?a=pxa6goHqzaA&amp;u=%2Fwatch%3Fv%3DdPdgx30w9sU%26feature%3Dshare"
              // have the real query string URI encoded behind a ';'.
              // at this point, `id is 'pxa6goHqzaA;u=%2Fwatch%3Fv%3DdPdgx30w9sU%26feature%3Dshare'
              var uriComponent = decodeURIComponent(id.split(';')[1]);
              id = ('http://youtube.com' + uriComponent)
                      .replace(youtubeRegexp, '$1');
          } else {
              // https://www.youtube.com/watch?v=VbNF9X1waSc&amp;feature=youtu.be
              // `id` looks like 'VbNF9X1waSc;feature=youtu.be' currently.
              // strip the ';feature=youtu.be'
              id = pieces[0];
          }
      } else if (contains(id, '#')) {
          // id might look like '93LvTKF_jW0#t=1'
          // and we want '93LvTKF_jW0'
          id = id.split('#')[0];
      }

      return id;
  }

  loadApi();

	//return deffered.promise;
  return {
    promise: deffered.promise,
    getIdFromURL: getIdFromURL
  };

}]);

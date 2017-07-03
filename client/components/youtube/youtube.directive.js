'use strict';

angular.module('cmp.youtube')

.constant('VideoStates', {
  UNSTARTED: -1,
  STOPPED: 1,
  PLAYING: 2,
  PAUSED: 3,
  BUFFERING: 4,
  ERROR: 5,
  UNDEFINED: 9
})

.directive('youtube', function(youtubeFactory, VideoStates, $window, $rootScope, _, videoService) {

  var eventPrefix = 'youtube.player.';
  var updateProgressInterval;

	return {
    restrict: 'E',
		template: '<div class="app-video-element-wrapper"><div class="app-video-element" mnt-processed="true"></div></div>',
    scope: {
        videoId: '=?',
        videoUrl: '=?',
        player: '=?',
        control: '=?'
    },
		link: function(scope, element, attrs){
      scope.internalControl = scope.control || {};
      scope.width = attrs.width || 640;
      scope.height = attrs.height || 390;
      scope.videoStates = VideoStates;
      var _YT;
      var initialLoad = false;
      //});

      function getState() {
        if (typeof scope.player === 'undefined') { return VideoStates.UNDEFINED; }
        return convertState(scope.player.getPlayerState());
      }

      function convertState(state){
        var map = {};
        map[_YT.PlayerState.PLAYING] = VideoStates.PLAYING;
        map[_YT.PlayerState.PAUSED] = VideoStates.PAUSED;
        map[_YT.PlayerState.ENDED] = VideoStates.STOPPED;
        map[_YT.PlayerState.QUEUED] = VideoStates.STOPPED;
        //map[_YT.PlayerState.BUFFERING] = VideoStates.BUFFERING;
        return map[state];
      }

      // YT calls callbacks outside of digest cycle
      function applyBroadcast () {
        var args = Array.prototype.slice.call(arguments);
        // no need for $apply if a $digest is already in progress
        if (scope.$root.$$phase === '$apply') {
          $rootScope.$broadcast.apply($rootScope, args);
        } else {
          scope.$apply(function () {
            $rootScope.$broadcast.apply($rootScope, args);
          });
        }
      }

      function onPlayerStateChange (event) {
        var state = getState(event.data);
        if (typeof state !== 'undefined') {
          handleState(state);
          applyBroadcast(eventPrefix + state, scope.player, event);
        }
        scope.$apply(function () {
          scope.player.currentState = state;
        });
      }

      // video metadata is only available after the video starts playing
      // progressBroadcast stops the video
      // TODO: remove stop from progressBroadcast to correct function
      var forceMetadata = function() {
        scope.player.mute();
        scope.player.playVideo();
      };

      function onPlayerReady (event) {
        forceMetadata();
        applyBroadcast(eventPrefix + 'ready', scope.player, event);
      }

      function onPlayerError (event) {
          applyBroadcast(eventPrefix + 'error', scope.player, event);
      }

      function progressBroadcast(seconds) {
        var total = scope.player.getDuration();
        var current = typeof seconds === 'number'? seconds : scope.player.getCurrentTime();

        // onReady the video needs to load before it's possible to scrub the video
        // let the video play for less then a second
        if (!initialLoad) {
          if (current > 0) {
            scope.player.pauseVideo();
            scope.player.seekTo(0, true);
            scope.player.unMute();
            initialLoad = true;
            applyBroadcast(eventPrefix + 'initialized', scope.player);
            resizeIframe();
          }
        } else {
          applyBroadcast(eventPrefix + 'progress', scope.player, {
            total: total,
            current: current,
            percent: 100 / total * current
          });
        }
      }

      scope.internalControl.play = function() {
        if (getState() === VideoStates.UNDEFINED) { return; }
        scope.player.playVideo();
      };

      scope.internalControl.pause = function() {
        if (getState() === VideoStates.UNDEFINED) { return; }
        scope.player.pauseVideo();
      };

      scope.internalControl.setCurrentTime = function(seconds) {
        if (getState() === VideoStates.UNDEFINED) { return; }
        scope.player.playVideo(); // fix black screen issue which occurs if to seek the video before playing it
        scope.player.pauseVideo();
        scope.player.seekTo(seconds, true);
        progressBroadcast(parseFloat(seconds));
      };

      scope.internalControl.mute = function() {
        scope.player.mute();
      };

      scope.internalControl.getTotalTime = function() {
        if (getState() === VideoStates.UNDEFINED) { return; }
        scope.player.getDuration();
      };

      // load video iframe
      youtubeFactory.promise.then(function(YT) {
        scope.YT = _YT = YT;
        var videoElement = element.find('.app-video-element').get(0);
        if (scope.videoUrl) {
          scope.videoId = youtubeFactory.getIdFromURL(scope.videoUrl);
        }
        // create video player
        scope.player = new YT.Player(videoElement, {
            height: scope.height,
            width: scope.width,
            playerVars: { controls: 0, modestbranding: 1, showinfo: 0, wmode: 'opaque', iv_load_policy: 3, playsinline: 1, rel: 0, html5: 1 },
            videoId: scope.videoId,
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
              onError: onPlayerError
            }
        });
      });

      var handleState = function(state) {
        // Start or stop updating progress bar
        clearInterval(updateProgressInterval);
        if(state === VideoStates.PLAYING){
          updateProgressInterval = setInterval(progressBroadcast, 200);
        } else if (state === VideoStates.PAUSED){
          progressBroadcast();
        }
      };

      // resize youtube iframe on window resize
      var resizeIframe = function() {
        var iframe = angular.element(element).find('iframe');
        var container = angular.element(element).closest('.app-video-container');
        var aspectRatio = videoService.aspectRatio = iframe.width() / iframe.height();

        if (!container.length) { return; }

        var onResize = function() {
          var width = container.width();
          iframe
            .width(width)
            .height(width / aspectRatio);
        };

        angular.element($window).bind('resize', _.throttle(onResize, 150));
        onResize();
      };

    }
  };
});

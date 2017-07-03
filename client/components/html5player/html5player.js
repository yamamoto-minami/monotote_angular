
(function(){
    "use strict";

    angular
    .module('cmp.html5player', ['cmp.video'])
    .config(Html5PlayerConfiguration);

    function Html5PlayerConfiguration(videoServiceProvider)
    {
        videoServiceProvider.registerVideoProvider('html5', {
			videoContainerTemplateUrl: 'components/html5player/html5-video-container.html',
            videoPluginPreviewTemplateUrl: 'components/html5player/html5-video-plugin-preview.html',
            regexp: /^https?:\/\/(?:.+)\.mp4(?:\?.*)?$/i
		})
    }
})();

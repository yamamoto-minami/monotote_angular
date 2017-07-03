(function(){
	'use strict';

	angular
	.module('cmp.youtube', ['cmp.video'])
	.config(YoutubeVideoConfiguration);

	YoutubeVideoConfiguration.$inject = ['videoServiceProvider'];
	function YoutubeVideoConfiguration(videoServiceProvider){
		videoServiceProvider.registerVideoProvider('youtube', {
			videoContainerTemplateUrl: 'components/youtube/youtube-video-container.html',
			videoMetaDataTemplateUrl: 'components/youtube/youtube-video-meta-data.html',
			videoPluginPreviewTemplateUrl: 'components/youtube/youtube-video-plugin-preview.html',
			regexp: /^https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*$/i
		})
	}	
})();

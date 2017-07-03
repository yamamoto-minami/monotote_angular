(function () {
	"use strict";

	angular
		.module('cmp.theme-management', [])
		.service('ThemeManagementService', ThemeManagementService);

	ThemeManagementService.$inject = ['$q', '$log', '$http', '$upload', 'Auth', 'SCT_CONFIG', 'Env', '_']
	function ThemeManagementService($q, $log, $http, $upload, Auth, SCT_CONFIG, Env, _) {
		var self = this;

		var apiUrl = SCT_CONFIG.environments[Env].apiUrl;

		/*self.uploadProperty = uploadProperty;
		self.uploadGroup = uploadGroup;
		self.uploadSection = uploadSection;*/
		self.uploadTheme = uploadTheme;
		self.removeTheme = removeTheme;
		/*self.removeSection = removeSection;
		self.removeProperty = removeProperty;*/
		self.getThemes = getThemes;
		self.getThemeById = getThemeById;
		//self.eraseTheme = eraseTheme;

		function getThemes() {
			return Auth.getCurrentUser()
				.then(function () {
					var headers = angular.extend({}, Auth.getIdentity());

					return $http({
						url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.themes,
						method: 'GET',
						headers: headers,
						api: true,
						cache: false
					})
					.then(function(response){
						$log.debug('get themes response', response);
						return response;
					})
				})
		}

		function getThemeById(themeId,fork) {
			return Auth.getCurrentUser()
				.then(function () {
					var headers = angular.extend({}, Auth.getIdentity());

					return $http({
						url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.themes + '/' + encodeURIComponent(themeId),
						method: 'GET',
						headers: headers,
						api: true
					})
					.then(function(response){
						$log.debug('get theme by id response', response);
						var themeData = /EDIT\:([^\n]+)/.exec(response.data.body.custom_css);
						var customCSS = /CUSTOM_CSS\:([^\n]+)/.exec(RegExp.rightContext);
						var cssData = RegExp.rightContext.split('[GENERATEDCODE]*/');
						if(themeData) {
							response.data.body.sections = JSON.parse(decodeURIComponent(themeData[1]));
						}
						if(customCSS) {
							response.data.body.custom_css = JSON.parse(decodeURIComponent(customCSS[1]));
						}
						response.data.body.template_css = cssData[0];
						if(fork) {
							response.data.body.template_css = forkCSS(forkCSS(response.data.body.template_css))
						}
						return response;
					})
				})
				.then(function(response){
					var sections = response.data.body.sections;
					response.data.body.properties = {};
					return $q.resolve()
					.then(function () {
						var preTasks = $q.resolve();
						sections.forEach(function(section){
							var groups = section.groups;
							_.keys(groups).forEach(function (groupKey) {
								groups[groupKey].forEach(function (property) {
									preTasks = preTasks
									.then(function () {
										response.data.body.properties[property.name] = property;
									});
								});
							});
						});
						return preTasks;
					})
					.then(function(){
						return response;
					})
				})
		}

		function forkCSS(code){
			return code.split('\n')
				.map(function(line){
					return line.replace(/^\s*[a-z_\-]+\:[^\;]+\;?\s*$/, function(m){
						if(/{\w+}/.test(m)) {
							return m;
						}
						return '\n';
					});
				}).join('\n')
				.replace(/[\#\@\(\)\[\]\'\"\=\^\sa-zA-Z_\-\d\.\,\:]+{\s*\}/g, '')
				.replace(/\n+/g,'\n');
		}

		function makeRequest(options) {
			options.headers = angular.extend(Auth.getIdentity(), options.headers || {})
			options.api = true;
			return $http(options)
				.then(function (response) {

					if (response && response.data && response.data.status && response.data.status.code !== 200) {
						$log.debug(response);
						$log.error('Failed to', options.method, options.url, JSON.stringify(response.data.status));
						return $q.reject(response);
					}
					$log.debug(response);
					return response;
				});
		}
/*
		function getUniqueId() {
			var id = (getUniqueId._id || 0) + 1;
			getUniqueId._id = id;
			return id;
		}

		function uploadProperty(themeId, sectionId, group, property) {
			var newProperty = property.id == null;
			if (newProperty) {
				property.id = getUniqueId();
			}
			if (property.name.indexOf(group + '.') !== 0) {
				property.name = group + '.' + property.name.toLowerCase().replace(/\s+/, '-');
			}
			return $q.resolve()
				.then(function () {
					if (property.type === 'image') {
						return $upload.upload({
							url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.upload + '/theme',
							file: property.localFile,
							fileFormDataName: 'image',
							headers: Auth.getIdentity(),
							api: true
						})
							.then(function (response) {
								property.uploadedImageUrl = 'url(' + response.data.body.url + ')';
							})
					}
				})
				.then(function () {
					return $http({
						method: newProperty ? 'POST' : 'PUT',
						url: apiUrl + "/publisher/plugin/themes/property/" + encodeURIComponent(themeId) + "/" + sectionId + "/" + encodeURIComponent(property.id),
						data: {
							name: property.name,
							type: property.type,
							css_selector: property.css_selector,
							value: property.uploadedImageUrl || property.value,
							sort_id: 1
						},
						json: true
					})
				})
		}

		function uploadGroup(themeId, sectionId, group) {
			return $q.resolve()
				.then(function () {
					var promises = [];
					_.keys(group).forEach(function (groupKey) {
						promises = promises.concat(group[groupKey].map(function (property) {
							return uploadProperty(themeId, sectionId, groupKey, property);
						}))
					})

					return $q.all(promises);
				})
		}

		function uploadSection(themeId, section) {
			return $q.resolve()
				.then(function () {
					// create section if not done already
					var newSection = section.id == null;
					$log.debug('update section');
					return makeRequest({
						method: newSection ? 'POST' : 'PUT',
						url: apiUrl + "/publisher/plugin/themes/section/" + encodeURIComponent(themeId),
						data: {
							name: section.name,
							sort_id: 1,
							section_id: section.id
						},
						json: true
					})
						.then(function (response) {
							section.id = response.data.body;
						})
				})
				.then(function () {
					// update groups
					return uploadGroup(themeId, section.id, section.groups);
				})
		}
*/
		function uploadTheme(theme, fork) {
			var sections = theme.sections.map(function(section){
				return {
					name: section.name,
					groups: section.groups
				}
			});
			var custom_css;
			var properties = {};
			
			return $q.resolve()
				.then(function () {
					var preTasks = $q.resolve();

					sections.forEach(function(section){
						section 
						var groups = section.groups;
						var groupsToUpload = {};
						_.keys(groups).forEach(function (groupKey) {
							groupsToUpload[groupKey] = [];
							groups[groupKey].forEach(function (property, index, array) {
								preTasks = preTasks
								.then(function () {
									properties[property.name] = {
										name: property.name,
										label: property.label,
										type: property.type,
										value: property.value
									};
									if (property.type === 'image' && property.localFile != null) {
										return $upload.upload({
											url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.upload + '/theme',
											file: property.localFile,
											fileFormDataName: 'image',
											headers: Auth.getIdentity(),
											api: true
										})
										.then(function (response) {
											delete property.localFile;
											property.value = response.data.body.url;
											property = {
												name: property.name,
												label: property.label,
												type: property.type,
												value: response.data.body.url
											};
											groupsToUpload[groupKey].push(property);
											properties[property.name] = property;
										})
									} else {
										groupsToUpload[groupKey].push(property);
									}
								})
							})
						})

						preTasks = preTasks
						.then(function(){
							section.groups = groupsToUpload;
						})
					})

					return preTasks.then(function(){
						custom_css = [
							'/*',
							'EDIT:'+encodeURIComponent(JSON.stringify(sections)),
							'CUSTOM_CSS:'+encodeURIComponent(JSON.stringify(theme.custom_css)),
							theme.template_css,
							'[GENERATEDCODE]*/',
							theme.template_css.replace(/{(\w+)}/g, function(m, p0){
								var property = properties[p0];
								if(property.type === 'image') {
									return property.value ? 'url(' + property.value + ')' : 'inherit-rule';
								}
								return property.value || 'inherit-rule';
							}),
							theme.custom_css
						].join('\n');
					})
				})
				.then(function () {
					return makeRequest({
						method: 'PUT',
						url: apiUrl + SCT_CONFIG.route.themes + (theme.id ? "/" + encodeURIComponent(theme.id) : ""),
						data: {
							name: theme.name,
							parent_theme: theme.parent_theme,
							custom_css: custom_css
						}
					})
						.then(function (response) {
							theme.id = response.data.body;
							$log.debug('submitted theme id', theme.id);
						});
				})/*
				.then(function () {
					var promises = sections.map(function (section) {
						return uploadSection(theme.id, section);
					});

					return $q.all(promises);
				})*/
		}
/*
		function removeProperty(themeId, sectionId, group, property) {
			var fullPropertyName = group + '.' + property;
			return $q.resolve()
				.then(function () {
					return makeRequest({
						method: 'DELETE',
						url: apiUrl + "/publisher/plugin/themes/property/" + encodeURIComponent(themeId) + "/" + sectionId + "/" + encodeURIComponent(property.id),
						json: true,
					})
				})
		}

		function removeSection(themeId, section) {
			return $q.resolve()
				.then(function () {
					var promises = [];
					// remove groups
					_.keys(section.groups).forEach(function (groupKey) {
						if(groupKey.indexOf('$') === 0) { return }

						section.groups[groupKey].forEach(function(property){
							promises.push(removeProperty(themeId, section.id, groupKey, property))
						})
					});

					return $q.all(promises);
				})
				.then(function () {
					return makeRequest({
						method: 'DELETE',
						url: apiUrl + "/publisher/plugin/themes/section/" + encodeURIComponent(themeId) + '/' + encodeURIComponent(section.id),
						json: true
					})
				})
		}

		function eraseTheme(themeId) {
			return getThemeById(themeId)
			.then(function(response){
				var theme = response.data.body;
				removeTheme(theme);
			})
		}
*/
		function removeTheme(themeId) {
			return $q.resolve()/*
				.then(function () {
					var promises = sections.map(function (section) {
						return removeSection(theme.id, section);
					});

					return $q.all(promises);
				})*/
				.then(function () {
					return makeRequest({
						method: 'DELETE',
						url: apiUrl + SCT_CONFIG.route.themes + "/" + encodeURIComponent(themeId),
						json: true
					});
				})
				.then(function(response){
					$log.debug('delete response', response);

				})
		}

	}
})();
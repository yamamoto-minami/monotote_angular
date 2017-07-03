'use strict';

angular.module('app.tagging')
	.controller('themesDesignerCtrl', function ($scope, SCT_CONFIG, Env, $upload, $window, $rootScope, $state, $stateParams, ThemeManagementService, $http, ngDialog, _, Auth, Product, $interval, $q, $sce, $location, $timeout, $document, $log, navMenu, Notification) {

		$scope.accordion = { id: null };

		/**** MAIN LOGIC *******/
		var headers = {};

		$scope.menu = navMenu;
		$scope.themeID = $stateParams.themeID;
		$scope.forkNewTheme = $stateParams.fork;
		$scope.loading = true;
		$scope.theme = {};
		$scope.mobile_list_show = false;
		$scope.percent_list_show = false;
		$scope.device_selector = 'com-1';
		$scope.mobile_list = ['Responsive', '', 'Galaxy S5', 'Nexus 5X', 'Nexus 6P', 'IPhone 5', 'IPhone 6', 'IPhone 6 Plus', 'IPad', 'IPad Pro'];
		$scope.percent_list = ['Fit to window', '', '50%', '75%', '100%', '125%', '150%'];

		$scope.current_mobile = 'Responsive';
		$scope.current_percent = '100%';
		$scope.mobile_width = 400;
		$scope.mobile_height = 800;
		$scope.ff = 1;

		$scope.changeMobile = function (mobile) {
			$scope.current_mobile = mobile;
			switch (mobile) {
				case "Responsive":
					$scope.setFrameSize(400, 800, 1);
					break;
				case "Galaxy S5":
					$scope.setFrameSize(360, 640, 0);
					break;
				case "Nexus 5X":
					$scope.setFrameSize(412, 732, 0);
					break;
				case "Nexus 6P":
					$scope.setFrameSize(412, 732, 0);
					break;
				case "IPhone 5":
					$scope.setFrameSize(320, 568, 0);
					break;
				case "IPhone 6":
					$scope.setFrameSize(375, 667, 0);
					break;
				case "IPhone 6Plus":
					$scope.setFrameSize(414, 736, 0);
					break;
				case "IPad":
					$scope.setFrameSize(768, 1024, 0);
					break;
				case "IPad Pro":
					$scope.setFrameSize(1024, 1366, 0);
					break;
			}
			$scope.changeSize();
		}

		$scope.changeSize = function () {
			var tt = $scope.current_percent;
			var rate = 1;

			switch (tt) {
				case "50%":
					rate = 0.5;
					break;
				case "75%":
					rate = 0.75;
					break;
				case "100%":
					rate = 1;
					break;
				case "125%":
					rate = 1.25;
					break;
				case "150%":
					rate = 1.5;
					break;
			}

			var w = $scope.mobile_width;
			var h = $scope.mobile_height;

			angular.element("#preview").width(w * rate);
			angular.element("#preview").height(h * rate);

			if ($scope.ff) {
				$scope.mobile_width = w;
				$scope.mobile_height = h;
			}
		}

		$scope.setFrameSize = function (w, h, flag) {
			$scope.ff = flag;

			$scope.mobile_width = w;
			$scope.mobile_height = h
			$scope.changeSize();
		}

		$scope.changePercent = function (percent) {
			$scope.current_percent = percent;
			$scope.changeSize();
		}

		$scope.iframeLoadedCallBack = function () {
			var preview = angular.element("#preview");
			preview.contents().find('head').append(jQuery('#iframe-contents-head').text());
			preview.contents().find('body').html(jQuery('#iframe-contents-body').text());
			var iframeWindow = preview.get(0);
			angular.element($window).on('plugin-ready', iframePluginLoaded);
			Auth.getCurrentUser()
				.then(function () {
					var keys = Auth.getIdentity();
					iframeWindow.contentWindow.eval(
						jQuery('#iframe-config').text()
							.replace(/{publisherKey}/, keys['api-key'])
							.replace(/{pluginUrl}/, SCT_CONFIG.environments[Env].pluginUrl)
					);
				});
		}

		$scope.initImage = function (property) {
			var image = new Image();
			image.onload = function () {
				$scope.$apply(function () {
					property.placeholder = property.value;
					property.imageSize = property.imagePlaceHolderSize = {
						width: image.width,
						height: image.height
					};
				});
			}
			image.src = property.value;
		}

		var iframePluginLoaded = function () {
			if ($scope.themeID) {
				angular.element($window).off('plugin-ready', iframePluginLoaded);

				ThemeManagementService.getThemeById($scope.themeID, $stateParams.fork)
					.then(function (response) {
						$scope.loading = false;
						$scope.theme = response.data.body;

						if ($stateParams.fork) {
							$scope.theme.parent_theme = $scope.theme.id;
							$scope.theme.id = '';
						} else if ($scope.theme.locked) {
							return $state.go('themes.list',{},{inherit:false});
						}

						$log.debug($scope.theme);

						updatePreview();
					}, function (error) {
						$scope.loading = false;
					});
			}
		}

		$scope.toggleMobileList = function () {
			$window.onclick = null;
			$scope.mobile_list_show = !$scope.mobile_list_show;
			$scope.percent_list_show = false;

			if ($scope.mobile_list_show) {
				$window.onclick = function (event) {
					$scope.mobile_list_show = false;
					$scope.percent_list_show = false;
					$scope.$apply();
				};
			}
		}

		$scope.togglePercentList = function () {
			$window.onclick = null;
			$scope.percent_list_show = !$scope.percent_list_show;
			$scope.mobile_list_show = false;

			if ($scope.percent_list_show) {
				$window.onclick = function (event) {
					$scope.mobile_list_show = false;
					$scope.percent_list_show = false;
					$scope.$apply();
				};
			}
		}

		$scope.rotate = function () {
			var temp = angular.copy($scope.mobile_width);
			$scope.mobile_width = angular.copy($scope.mobile_height);
			$scope.mobile_height = angular.copy(temp);

			$scope.setFrameSize($scope.mobile_width, $scope.mobile_height, $scope.ff);
		}

		$scope.showSettingsPanel = function () {
			angular.element(".left-area").css("display", "none");
			angular.element(".right-bar").css("display", "block");
			angular.element(".view-rightbar").css("display", "none");
			angular.element(".view-preview").css("display", "inline-block");
		}

		$scope.hideSettingsPanel = function () {
			angular.element(".left-area").css("display", "block");
			angular.element(".right-bar").css("display", "none");
			angular.element(".view-rightbar").css("display", "inline-block");
			angular.element(".view-preview").css("display", "none");
		}

		$scope.selectFile = function (event) {
			angular.element(event.target).parent().next().find(".imgInp").click();
		}

		$scope.updatePreview = updatePreview;

		$scope.imageChange = function (input, obj) {
			if (input[0]) {
				var imageUrlLocal = URL.createObjectURL(input[0]);

				var image = new Image();
				image.src = imageUrlLocal;
				image.onload = function () {
					$scope.$apply(function () {
						obj.imageSize = {width: image.width, height: image.height};
						obj.value = imageUrlLocal;
						obj.localFile = input[0]; // for uploading images
						updatePreview();
					});
				}
			}
		}

		$scope.resetToDefault = function (property) {
			if(property.type === 'image') {
				property.imageSize = property.imagePlaceHolderSize;
				property.value = property.placeholder;
			} else {
				if(!(property.value||'').trim() && $scope.theme.parent_theme && property.placeholder) {
					property.value = property.placeholder;
				}
			}
		};

		$scope.hidePropertyValue = function (property) {
			if (($scope.theme.parent_theme) && ($stateParams.fork)){
				property.placeholder = angular.copy(property.value);
			}
		};

		$scope.recycleImage = function (obj) {
			obj.value = "";
			obj.localFile = null;
			$scope.resetToDefault(obj);
			updatePreview();
		};

		$scope.save = function () {
			$scope.loading = true;
			return ThemeManagementService.uploadTheme($scope.theme, $stateParams.fork)
				.then(function () {
					$scope.loading = false;
					$state.go($state.current.name, {themeID: $scope.theme.id}, {replace:true, notify:false});
					Notification.primary({
        				positionX: 'center',
        				message: 'The theme was successfully saved!'
      				})
				}, function (response) {
					$scope.loading = false;
					Notification.error({
        				positionX: 'center',
        				message: response && response.data && response.data.status ? 'Unable to save the theme: ' + response.data.status.message : 'Failed to save the theme'
      				})
				});

		};

		var dt = Date.now();

		function updatePreview() {
			if (!$scope.theme || !$scope.theme.sections) { return; }
			$scope.theme.parent_theme &&
			angular.element('#preview').contents().find('body')
				.find('#parent-theme').length === 0 && 
				angular.element('#preview').contents().find('body').append(
					angular.element('<link id="parent-theme" rel="stylesheet">').attr('href',SCT_CONFIG.environments[Env].themesUrl.replace(/{themeId}/, $scope.theme.parent_theme) + '?'+dt)
				);
			angular.element('#preview').contents().find('body')
				.find('#preview-changes').remove().end()
				.append(
				angular.element('<style id="preview-changes">').text([
					$scope.theme.custom_css || '',
					/*renderTemplate('theme-generator', {
						properties: getCssSensitiveProperties($scope.theme) // TODO: optimize this
					})*/
					$scope.theme.template_css.replace(/\{(\w+)\}/g, function(m, p0){
						var property = $scope.theme.properties[p0];
						if(property.type === 'image') {
							return property.value ? 'url(' + property.value + ')' : 'inherit-rule';
						}
						return property.value || 'inherit-rule';
					})
				].join('\n'))
				);
		}

		function getCssSensitiveProperties(theme) {
			var properties = [];
			theme.sections.forEach(function (section) {
				_.keys(section.groups).forEach(function (groupId) {
					if (groupId.indexOf('$') > -1) return; // skip angular keys
					section.groups[groupId].forEach(function (property) {
						properties.push({
							selector: property.css_selector,
							name: property.name.toLowerCase(),
							value: property.value,
							type: property.type
						})
					})
				});
			})
			return properties;
		}

		function renderTemplate(id, data) {
			renderTemplate
			var fn = new Function("$INPUT",
				(window.lastTemplateCode = "" +
					"var render=this.render;" +
					"var p=[],length=function(arr) {return arr.length};" +
					// Introduce the data as local variables using with() {}
					"with($INPUT) {p.push(\"" +

					// Convert the template into pure JavaScript
					('\r\r' + (jQuery('#' + id).text()
						.replace(/[\r\t]/g, " ")) + '\r\r')
						.split("<%").join("\t")
						.split("%>").join("\r")
						.replace(/\t=([^\r]+)?\r/g, "\r\r\",$1,\"\r\r")
						.replace(/\t([^\r]+)?\r/g, "\r\r\");$1;p.push(\"\r\r")
						.replace(/\r\r([^\r]+)?\r\r/g, function (m, p0) {
							if (!p0) return '';
							return p0.replace(/[\"\\]/g, '\\$&').replace(/\n/g, ' ');
						})
					+ "\");}return p.join('');")).bind({
						render: renderTemplate
					});

			// Provide some basic currying to the user
			return data ? fn(data) : fn;
		}

	})
	.directive('iframeOnload', [function () {
		return {
			scope: {
				callBack: '&iframeOnload'
			},
			link: function (scope, element, attrs) {
				element.on('load', function () {
					return scope.callBack();
				})
			}
		}
	}]);
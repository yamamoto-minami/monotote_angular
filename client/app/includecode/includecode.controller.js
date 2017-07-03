'use strict';

angular.module('app.includecode')
.controller('includeCodeCtrl', function ($scope, $window, $timeout, Auth, SCT_CONFIG, Env, Copy2ClipboardFactory, Publisher, PluginJackService) {

    $scope.pluginURL = SCT_CONFIG.environments[Env].pluginUrl;
    $scope.pluginCheckInput = {};

    $scope.useTheme = $window.localStorage.mntCurrentPluginTheme && angular.toJson($window.localStorage.mntCurrentPluginTheme) || null;

    $scope.ident = function(){
        return Auth.getIdentity();
    };

    // used in combination with ng-clip to copy publish step code example to clipboard
    $scope.getEmbedCode = function(name) {
      return angular.element('[data-code="' + name + '"]').text();
    };

    $scope.copy2Clipboard = function(text) {
        Copy2ClipboardFactory(text)
        .then(onCopy);
    };

    $scope.onCopy = onCopy;

    $scope.testPluginConnection = testPluginConnection;

    Publisher.profile()
    .then(function(profile){
        if(profile) {
            $scope.profile = profile;
            $scope.pluginCheckInput.url = profile.company.website;
            $scope.testPluginConnection();
        }
    })
    
    var triggerTestPlugin;
    function testPluginConnection(){
        $scope.pluginConnectStatus = 'checking';
        var trigger = triggerTestPlugin = Date.now(); 
        PluginJackService
        .testPluginConnection($scope.pluginCheckInput.url)
        .then(function success(){
            if(trigger !== triggerTestPlugin) return;
            $scope.pluginConnectStatus = 'success';
        }, function fail(errorType){
            if(trigger !== triggerTestPlugin) return;
            $scope.pluginConnectStatus = errorType && errorType || 'danger';
        })
    }

    function onCopy(automatedCopy)
    {
        if(!automatedCopy) return;
        if($scope.copyStatusSuccess)
            $timeout.cancel($scope.copyStatusSuccess);
        $scope.copyStatusSuccess = $timeout(function(){
            $scope.copyStatusSuccess = null;
        }, 2000);
    }
});

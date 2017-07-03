(function(){
    "use strict";

    angular
    .module('app.profile')
    .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$inject = ['$scope', '$q', '$window',  'Auth', 'Publisher', 'GoogleAnalyticsService', 'SCT_CONFIG'];
    function ChangePasswordController($scope, $q, $window, Auth, Publisher, GoogleAnalyticsService, SCT_CONFIG)
    {
        $scope.templates = {
            notifications: 'app/profile/notifications.html',
            edit: 'app/profile/changePassword-edit.html'
        };

        clearValues();

        if($window.localStorage.hasOwnProperty(SCT_CONFIG.tempPasswordStorageKey)) {
            $scope.profile.oldPassword = $window.localStorage[SCT_CONFIG.tempPasswordStorageKey];
            $scope.profile.firstTime = true;
            delete $window.localStorage[SCT_CONFIG.tempPasswordStorageKey];
        }

        $scope.submit = submit;
        $scope.isValid = isValid;

        function clearValues()
        {
            $scope.profile = {
                oldPassword: '',
                newPassword: '',
                repeatPassword: ''
            };  
        }

        function isValid()
        {
            return $scope.profileForm.$valid && $scope.profile.newPassword === $scope.profile.repeatPassword;
        }

        function submit()
        {
            if (!$scope.profileForm.$valid || !$scope.profileForm.$dirty) return;

            if($scope.profile.firstTime) {
                GoogleAnalyticsService.createEvent({
                    eventCategory: 'Signup',
                    eventAction: 'setPassword',
                    eventLabel: 'set password'
                });
            }
      
            $q.resolve()
            .then(function(){
                $scope.state = null;
                $scope.status = null;
                $scope.error = null;
            })
            .then(function(){
                return Auth.getCurrentUser()
                .then(function(val){
                    return Publisher
                    .changePassword(val.user.user_hash, $scope.profile.oldPassword, $scope.profile.newPassword);
                });
            })
            .then(function(status) {
                if (_.has(status, 'text')) {
                    $scope.status = status.text;
                }
            })
            .then(function(){
                clearValues();
                $scope.profileForm.$setPristine();
                $scope.$emit('user.password.set');
            })
            .catch(function(reason) {
                $scope.error = _.get(reason, 'text') || 'Failed to submit the data.';
            })
            .finally(function(){
                $scope.state = 0;
            });
        }
    }
})();
(function(){
    'use strict';
    
    angular
    .module('app.reset-forgotten-password')
    .controller('PasswordResetController', PasswordResetController);
    
    PasswordResetController.$inject = ['$scope','ngDialog','$location','Auth'];
    function PasswordResetController($scope, ngDialog, $location, Auth)
    {
        Auth.isLoggedInAsync(function(val){
            if(val) return $location.url("/");
            
            var dialog = ngDialog.open({
                templateUrl: 'app/reset-forgotten-password/reset-forgotten-password.html',
                showClose: false,
                closeByEscape: false,
                closeByDocument: false,
                overlay: false,
                disableAnimation: true,
                className: 'ngdialog-overlay login-dialog',
                controller: ModalController
            });
            
            $scope.$on('$destroy', function(){
                dialog.close();
            });
        })
    }
    
    ModalController.$inject = ['$scope', '$rootScope', '$state','$stateParams','Auth','$log', 'SCT_CONFIG'];
    function ModalController($scope, $rootScope, $state, $stateParams, Auth, $log, SCT_CONFIG)
    {
        $scope.requestForgotPasswordLink = requestForgotPasswordLink;
        $scope.resetForgottenPassword = resetForgottenPassword;
        $scope.user = {};
        $scope.$watchGroup(['user.email','user.password','user.repeatPassword'],clearApiErrors);
        $scope.hasToken = !!$stateParams.forgotToken;
        $scope.submitting = false;
        
        function clearApiErrors(){
            $scope.errors = "";
        }
        
        function requestForgotPasswordLink(form) {
            if(!form.$valid || $scope.submitting) return;
            $scope.submitting = true;
            Auth.requestForgotPasswordLink($scope.user.email, $state.href("passwordResetLink", {
                email: $scope.user.email
            }, {absolute: true}).replace(/\/$/, ''))
            .then(function(){
                $scope.resultSuccess = true;
            })
            .catch(function(err){
                $log.debug('request link failed',err);
                $scope.errors = err && err.text || 'Failed to request link: unknown error!';
            })
            .then(function(){
                $scope.submitting = false;
            })
        }
        
        function resetForgottenPassword(form) {
            if(!form.$valid || $scope.user.password !== $scope.user.repeatPassword || $scope.submitting) return;
            $scope.submitting = true;
            Auth.resetForgottenPassword($stateParams.forgotToken, $scope.user.password)
            .then(function(){
                if($stateParams.email) {
                    return Auth
                    .login({
                        email: $stateParams.email,
                        password: $scope.user.password
                    })
                    .then(function(){
                        $rootScope.$broadcast('user.set');
                        $state.go(SCT_CONFIG.defaultRoute);
                    })
                    .catch(function() {
                        $state.go('login');
                    });
                }
                else $state.go('login');
            })
            .catch(function(err){
                $log.debug('reset password failed',err);
                $scope.errors = err && err.text || 'Failed to reset password: unknown error!';
            })
            .then(function(){
                $scope.submitting = false;
            });
        }
    }
    
})();
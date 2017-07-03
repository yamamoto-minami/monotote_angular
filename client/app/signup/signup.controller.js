(function(){
    'use strict';
    
    angular
    .module('app.signup')
    .controller('SignupController', SignupController);
    
    SignupController.$inject = ['$scope','$state','$stateParams','ngDialog','$location','Auth'];
    function SignupController($scope, $state, $stateParams, ngDialog, $location, Auth)
    {
        if($state.current.name === 'signupSuccess') {
            return $state.go('login', {}, {
                replace: true,
                inherit: false
            });
        }

        Auth.isLoggedInAsync(function(val){
            if(val) return $location.url("/");
            
            var dialog = ngDialog.open({
                templateUrl: 'app/signup/signup.html',
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
    
    ModalController.$inject = ['$scope', '$state', '$stateParams', '$window', '$sce', 'Auth', 'AffiliateService', 'Base64Factory', 'GoogleAnalyticsService', 'SCT_CONFIG', '_'];
    function ModalController($scope, $state, $stateParams, $window, $sce, Auth, AffiliateService, Base64Factory, GoogleAnalyticsService, SCT_CONFIG, _)
    {
        $scope.data = {
            user: {},
            company: {}
        };
        $scope.signup = signup;
        $scope.result = null;

        $scope.backToSignup = backToSignup;
        $scope.validateCompanyUrl = validateCompanyUrl;

        $scope.$watch('data', removeApiErrorMessages, true);

        $scope.largeScreen = $window.innerWidth >= 860;

        angular.element($window).on('resize', onResize);

        $scope.$on('$destroy', function(){
            angular.element($window).off('resize', onResize);
        })

        GoogleAnalyticsService.createEvent({
            eventCategory: 'Signup',
            eventAction: 'pageLoad',
            eventLabel: 'Page load'
        });

        if($stateParams.ref) {
            AffiliateService.getAffiliate($stateParams.ref)
            .then(function(affiliate){
                $scope.affiliate = affiliate;
                _.get($scope.affiliate, 'keys', []).forEach(function(x){
                    x.description && $sce.trustAsHtml(x.description);
                })
            })
            .catch(function(){
                return $state.go('signup', {ref:'awin'}, {inherit: false, replace: true});
            });
        } else {
            return $state.go('signup', {ref:'awin'}, {inherit: false, replace: true});
        }

        function validateCompanyUrl()
        {
            if(/^https?\:\/\//i.test($scope.data.company.website) === false) {
                $scope.errors = {};
                $scope.errors['company.website'] = 'Please provide a link in the following format: https://www.monotote.com';
            }
        }

        function onResize(){
            $scope.$apply(function(){
                $scope.largeScreen = $window.innerWidth >= 860;
            })
        }

        function removeApiErrorMessages()
        {
            $scope.errors = null;
            $scope.errorType = null;
        }

        function backToSignup()
        {
            $scope.errors = null;
            $scope.errorTitle = null;
            $scope.result = null;
        }
        
        function signup(form, $event)
        {
            if(!form.$valid || $scope.submitting) return;
            $scope.submitting = true;
            GoogleAnalyticsService.createEvent({
                eventCategory: 'Signup',
                eventAction: 'signupSubmit',
                eventLabel: 'Signup submit'
            });
            removeApiErrorMessages();
            Auth.createUser($scope.data, $stateParams.ref)
            .then(function(){
                $scope.result = 'success';
                angular.element($event.target).closest('.ngdialog').addClass('signup-success');
                $state.go('signupSuccess', {
                    valid: true
                }, {
                    notify: false,
                    replace: true,
                    inherit: false
                })
            })
            .catch(function(err){
                console.log('registration failed',err);
                if(err.error_type === 'invalid_affiliate_key') {
                    $scope.result = 'affiliate-error';
                    $scope.errorTitle = err.text;
                    $scope.errors = $sce.trustAsHtml(err.errors);
                    return;
                }
                $scope.errors = err && (err.errors ? err.errors : err.text && {static:err.text}) || {static:'Failed to register: unknown error!'};
                _.each($scope.errors,function(val,key){
                    if(/^keys\./.test(key)) {
                        $scope.errors[key] = val.replace(/\bkeys\./i, '');
                    }
                });
                $scope.errorType = err && (err.error_type === 'validation_error' ? _.findKey($scope.errors, function(){ return true; }) : err.error_type);
                if($scope.errorType === 'user.state' || $scope.errorType === 'company.state') {
                    var countryError = $scope.errorType.replace(/\.state$/, '.country');
                    if($scope.errors.hasOwnProperty(countryError))
                        $scope.errorType = countryError;
                }
            })
            .then(function(){
                $scope.submitting = false;
            });
        }
    }
    
})();
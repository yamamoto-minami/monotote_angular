'use strict';

angular.module('app.profile')
.controller('ProfileCtrl', function ($scope, $rootScope, $q, Publisher, $window, $upload, SCT_CONFIG, Env, Thumbnail, GetCountriesFactory, _) {

  $scope.state = 0; // state of the http request

  $scope.profile = {};
  $scope.isHTML5 = !!($window.File && $window.FormData);
  $scope.defaultCountry = {state_label:'State'};
  $scope.images = {
    avatar: {},
    logo: {}
  };
  $scope.status = null;
  $scope.onUserCountryChange = onUserCountryChange;
  $scope.onCompanyCountryChange = onCompanyCountryChange;

  $scope.templates = {
    notifications: 'app/profile/notifications.html',
    edit: 'app/profile/profile-edit.html'
  };

  GetCountriesFactory
  .then(function(countries){
    $scope.countries = countries;
  });

  function onUserCountryChange(clear)
  {
    if(clear) $scope.profile.user.state = null;
    
    $scope.userCountry = _.find($scope.countries, 'code', $scope.profile.user.country) || $scope.defaultCountry;
    $scope.userCountryStates = $scope.userCountry && $scope.userCountry.states || null;
  }

  function onCompanyCountryChange(clear)
  {
    if(clear) $scope.profile.company.state = null;

    $scope.companyCountry = _.find($scope.countries, 'code', $scope.profile.company.country) || $scope.defaultCountry;
    $scope.companyCountryStates = $scope.companyCountry && $scope.companyCountry.states || null;
  }

  // for ng-file-drop
  $scope.$watch('profile.avatar_file', function () {
    $scope.upload($scope.profile.avatar_file, 'avatar');
  });
  $scope.$watch('profile.logo_file', function () {
    $scope.upload($scope.profile.logo_file, 'logo');
  });

  $scope.onFieldChange = function(field){
    $scope.errors && ($scope.errors[field] = null);
  };

  $scope.upload = function(files, type) {
    var file;
    if (files && files.length === 1) {
      $scope.images[type].file = file = files[0];
      //uploadReset(image);
      $upload.upload({
        url: SCT_CONFIG.environments[Env].apiUrl + SCT_CONFIG.route.upload + '/' + type,
        file: file,
        fileFormDataName: 'image',
        headers: {
          'api-key': $scope.profile.company.api_key,
          'user-hash': $scope.profile.user.user_hash
        },
        api: true
      })
      .success(uploadSuccess.bind($scope.images[type]));
    }
  };

  function uploadSuccess(data, status) {
    var image = this;
    if (status === 200) {
        if (data && data.body && data.body.url) {
          image.url = data.body.url;
          if(image === $scope.images.avatar) {
            $scope.profile.user.profile_img = image.url;
            $rootScope.$broadcast('profile.update', {
              firstname: $scope.profile.user.first_name,
              lastname: $scope.profile.user.last_name,
              email: $scope.profile.user.email,
              image: $scope.profile.user.profile_img
            });
          }
          if(image === $scope.images.logo) {
            $scope.profile.company.logo = image.url;
          }
        } else {
          image.error = 'Image upload failed';
        }
    } else {
        image.error = 'Image upload failed';
    }
  }

  function uploadReset() {
    $scope.image.progress = 0;
  }

  function getProfile() {
      Publisher.profile()
      .then(function(res) {
        $scope.profile = res;
        if (res.user.profile_img) {
            $scope.images.avatar.url = res.user.profile_img;
        }
        if (res.company.logo) {
            $scope.images.logo.url = res.company.logo;
        }
        onUserCountryChange(false);
        onCompanyCountryChange(false);
        $scope.profileForm.$setPristine();
      });
  }

  $scope.profileImage = function() {
    return $scope.images.avatar.url ? Thumbnail.size($scope.images.avatar.url, 60, 60) :  SCT_CONFIG.defaultProfileImage;
  };

  $scope.companyImage = function() {
    return $scope.images.logo.url ? Thumbnail.size($scope.images.logo.url, 60, 60) :  SCT_CONFIG.defaultThumbnailImage;
  };

  $scope.isValid = function() {
      return $scope.profileForm.$valid;
  };

  $scope.submit = function() {
      if (!$scope.profileForm.$valid || !$scope.profileForm.$dirty) return;
      
      $q.resolve()
      .then(function(){
          $scope.state = null;
          $scope.status = null;
          $scope.errorType = null;
          $scope.errors = null;
      })
      .then(function(){
          $scope.state = 1;
          var profile = {
            'user': $scope.profile.user,
            'company': $scope.profile.company
          };
          
          return Publisher.update(angular.fromJson(angular.toJson(profile)))
      })
      .then(function(data) {
          if (_.has(data, 'status.text')) {
              $scope.status = data.status.text;
          }
          getProfile();
      })
      .catch(function(reason) {
          reason = reason || {};
          $scope.errors = reason.status && (reason.body ? reason.body : _.get(reason, 'status.text') && {static:_.get(reason, 'status.text')}) || {static:'Failed to submit the data.'};
          $scope.errorType = reason.status && (_.get(reason, 'status.error_type') === 'validation_error' ? _.findKey($scope.errors, function(){ return true; }) : _.get(reason, 'status.error_type'));
          if($scope.errorType === 'user.state' || $scope.errorType === 'company.state') {
              var countryError = $scope.errorType.replace(/\.state$/, '.country');
              if($scope.errors.hasOwnProperty(countryError))
                  $scope.errorType = countryError;
          }
      })
      .finally(function(){
          $scope.state = 0;
      });
  };

  getProfile();
});



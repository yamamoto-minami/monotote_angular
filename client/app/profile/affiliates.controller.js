'use strict';

angular.module('app.profile')
.controller('AffiliatesCtrl', function ($scope, $state, $stateParams, AffiliateSettingsService, _) {
  $scope.input = {};
  $scope.companies = [];
  $scope.templates = {
    notifications: 'app/profile/notifications.html',
    edit: 'app/profile/affiliates-edit.html'
  };

  $scope.input.selectedAffiliate = $stateParams.company || null;

  $scope.viewBag = {};
  
  $scope.refresh = getAffiliates;
  $scope.companyChange = companyChange;
  $scope.updateViewBag = updateViewBag;

  getAffiliates();

  function companyChange(companyId) {
    if(typeof(companyId)==='string') {
      if($scope.input.selectedAffiliate === companyId) return;
      $scope.input.selectedAffiliate = companyId;
    }
    if(!$scope.input.selectedAffiliate) return;
    $state.go($state.current.name, {company: $scope.input.selectedAffiliate}, {notify: false, replace: !$stateParams.company});

    _.each($scope.viewBag, function(viewBag){
      viewBag.errors = {};
      viewBag.error = false;
    });

    _.forEach($scope.companies, function(company){
      _.forEach(company.sites, function(site){
        _.forEach(site.keys, function(key, i){
          site.keys[i] = angular.fromJson(angular.toJson($scope.viewBag[company.id].prestineValues[[site.id, key.id].join('.')]));
        })
      })
    })
  }


  function getAffiliates() {
      AffiliateSettingsService.getSkeleton()
      .then(function(companies) {
          $scope.companies = companies;
          delete $scope.companies.debug;
          updateViewBag();
      });
  }

  function initCompany(company) {
    $scope.viewBag[company.id] = $scope.viewBag[company.id] || {
      errors: {},
      prestineValues: {}
    };

    _.forEach(company.sites, function(site){
      _.forEach(site.keys, function(key){
        $scope.viewBag[company.id].prestineValues[[site.id, key.id].join('.')] = angular.fromJson(angular.toJson(key));
      })
    })
  }

  function updateViewBag() {
    _.forEach($scope.companies, initCompany);
  }


});



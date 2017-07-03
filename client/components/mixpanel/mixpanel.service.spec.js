/* global xdescribe */
'use strict';

xdescribe('Service: mixpanel', function () {

  // load the service's module
  beforeEach(module('cmp.mixpanel'));

  beforeEach(function() {
    var self = this;

    self.config = function() {
      return {
        mixpanel_token: '2a06ea1877d261975fa0763c93b8725a',
        mixpanel_base_url:'https://mixpanel.com/api/2.0/'
      };
    };

    angular.mock.module('cmp.config', { SCT_CONFIG: self.config });
  });
  // instantiate service
  //beforeEach(inject(function () {
  //  var Mixpanel;

  //  var self = this;
  //  self.config = {
  //    mixpanel_token: '2a06ea1877d261975fa0763c93b8725a',
  //    mixpanel_base_url:'https://mixpanel.com/api/2.0/'
  //  };

  //  angular.mock.module('cmp.config', self.config);

  //  //Mixpanel = $injector.get('Mixpanel');
  //  //createMixpanel = function() {
  //  //  return Mixpanel;
  //  //};

  //}));

  it('should include required mixpanel REST API values', function() {
    angular.mock.inject(['cmp.config', function(config) {

      expect(true).toEqual(true);
      ['mixpanel_token', 'mixpanel_base_url'].forEach(function(v) {
          expect(config[v]).toBeDefined();
      });

    }]);
  });

  it('should include required mixpanel REST API values', function() {

  });

});

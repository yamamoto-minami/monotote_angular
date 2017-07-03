/* global xdescribe */
'use strict';

xdescribe('Directive: rangeSlider', function () {

  // load the directive's module
  beforeEach(module('cmp.rangeSlider'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<range-slider></range-slider>');
    element = $compile(element)(scope);
  }));
});

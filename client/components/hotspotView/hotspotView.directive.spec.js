/* global xdescribe */
'use strict';

xdescribe('Directive: hotspot', function () {

  // load the directive's module and view
  beforeEach(module('cmp.hotspotView'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hotspot-view></hotspot-view>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the hotspot directive');
  }));
});

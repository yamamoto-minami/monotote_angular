/* global xdescribe */
'use strict';

xdescribe('Directive: hotspotListView', function () {

  // load the directive's module and view
  beforeEach(module('cmp.hotspotListView'));
  beforeEach(module('components/hotspotListView/hostspotListView.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hotspot-view></hotspot-view>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the hostspotListView directive');
  }));
});

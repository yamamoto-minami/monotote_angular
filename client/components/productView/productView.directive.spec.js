/* global xdescribe */
'use strict';

xdescribe('Directive: productView', function () {

  // load the directive's module and view
  beforeEach(module('cmp.productView'));
  beforeEach(module('components/productView/productView.html'));

  //var element, scope;

  //beforeEach(inject(function ($rootScope) {
  //  scope = $rootScope.$new();
  //}));

  //it('should make hidden element visible', inject(function ($compile) {
  //  element = angular.element('<product-view></product-view>');
  //  element = $compile(element)(scope);
  //  scope.$apply();
  //  expect(element.text()).toBe('this is the productView directive');
  //}));
});

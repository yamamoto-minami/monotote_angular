'use strict';

describe('Directive: productBrowser', function () {

  // load the directive's module and view
  beforeEach(module('appSctApp'));
  beforeEach(module('components/productBrowser/productBrowser.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<product-browser></product-browser>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the productBrowser directive');
  }));
});
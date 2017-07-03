/* global xdescribe */
'use strict';

xdescribe('Filter: momentFromNow', function () {

  // load the filter's module
  beforeEach(module('cmp.moment'));

  // initialize a new instance of the filter before each test
  var momentFromNow;
  beforeEach(inject(function ($filter) {
    momentFromNow = $filter('momentFromNow');
  }));

  it('should have momentjs available"', function () {
    expect(window.moment).toBeDefined();
    expect(moment).toBeDefined();
  });

  //it('should return the input prefixed with "momentFromNow filter:"', function () {
  //  var yesterday = moment().subtract(1, 'days');
  //  expect(momentFromNow(yesterday)).toBe('momentFromNow filter: ' + text);
  //});

});

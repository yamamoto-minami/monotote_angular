/* global xdescribe */
'use strict';

xdescribe('Service: lodash', function () {

  // load the service's module
  beforeEach(module('cmp.lodash'));

  // instantiate service
  var lodash;
  beforeEach(inject(function (_lodash_) {
    lodash = _lodash_;
  }));

  it('should do something', function () {
    expect(!!lodash).toBe(true);
  });

});
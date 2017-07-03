/* global before */
'use strict';

require('should');
var supertest = require('supertest-as-promised');
var config    = require('./environment');
var util      = require('./util');
var request   = supertest(config.api.url);
var token     = null;

describe('API categories', function() {

  this.timeout(config.longTimeout); // increase mocha default timeout

  before(function(done) {
      util.oauth()
      .then(function(res) {
          token = res;
          done();
      });
  });

  describe('Get Category Listing', function() {

      it('should return the category listing', function() {
        return request
        .get(config.api.routes.categories)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function (res) {
            var json = JSON.parse(res.text);
            json.should.have.property('status');
            json.should.have.property('body');
            //
            var keys = Object.keys(json.body);
            keys.length.should.not.equal(0);
        });
      });

  });

});

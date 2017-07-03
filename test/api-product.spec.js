/* global before */
'use strict';

require('should');
var supertest = require('supertest-as-promised');
var config    = require('./environment');
var util      = require('./util');
var request   = supertest(config.api.url);

var token     = null;

describe('API Product endpoint', function() {

  this.timeout(config.longTimeout); // increase mocha default timeout

  before(function(done) {
      util.oauth()
      .then(function(res) {
          token = res;
          done();
      });
  });

  describe('Get Products Listing', function() {

      it('should return product listings based on the publisher_hash', function() {

        return util.getPublisher()
        .then(function (res) {
            var company = res.company_profile;

            return request
            .get(config.api.routes.productsMonotote)
            .set('api-key', company.api_key)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/);
        })
        .then(function (res) {
            var json = JSON.parse(res.text);
            json.should.have.property('status');
            json.should.have.property('body');

            var data = json.body.data;
            data.should.have.property('meta');
            data.should.have.property('input');
            data.should.have.property('available_filters');
            data.should.have.property('products');
        });
      });

  });

  describe('Universes', function() {

      it('should a return list of available universes', function() {

          return request
          .get(config.api.routes.universes)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .then(function(res) {
              var json = JSON.parse(res.text);
              json.should.have.property('status');
              json.should.have.property('body');
              json.body.should.be.type('object');

              var keys = Object.keys(json.body);
              keys.length.should.not.equal(0);
          });
      });
  });

});

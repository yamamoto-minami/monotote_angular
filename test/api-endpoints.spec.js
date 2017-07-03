'use strict';

require('should');
var supertest = require('supertest-as-promised');
var config    = require('./environment');
var request   = supertest(config.api.url);
var async     = require('async');

var routes       = config.api.routes;

function loopUrl(urls, done) {
    async.each(urls, function(url, done) {
      request
      .head(url)
      .then(function(res) {
        if (res.status === 404) {
          done(404);
        } else {
          done();
        }
      })
      .catch(function(err) {
        done(err);
      });
    }, function(err) {
      done(err);
    });
}

describe('API endpoint listing', function() {

    this.timeout(config.longTimeout); // increase mocha default timeout

    it('should find product endpoints', function(done) {
      loopUrl([
        routes.productsMonotote,
        routes.productsMonototeFilter,
        routes.universes
      ], done);
    });

    it('should find publisher endpoints', function(done) {
      loopUrl([
        routes.publisher
      ], done);
    });

    it('should find shoppables endpoints', function(done) {
      loopUrl([
        routes.shoppables,
        routes.shoppablesUpload
      ], done);
    });
});

'use strict';

require('should');
var supertest = require('supertest-as-promised');
var config = require('./environment');
var request   = supertest(config.api.url);

describe('API OAuth', function() {

  this.timeout(config.longTimeout); // increase mocha default timeout

  describe('login', function() {

      it('should return an access token', function() {
        return request
        .post(config.api.routes.oauth)
        .send({
          'grant_type': 'password',
          'client_id': config.oauth.client.id,
          'client_secret': config.oauth.client.secret,
          'username':  config.user.username,
          'password': config.user.password
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function (res) {
          var json = JSON.parse(res.text);
          json.should.have.property('access_token');
          json.should.have.property('token_type', 'Bearer');
          json.should.have.property('expires_in', '3600');
        });
      });

      it('should return invalid request', function() {
        return request
        .post(config.api.routes.oauth)
        .send({
          'grant_type': 'password',
          'client_id': config.oauth.client.id,
          'client_secret': config.oauth.client.secret,
          'username':  config.user.username,
          'password': 'none'
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .then(function (res) {
          var json = JSON.parse(res.text);
          json.should.have.property('error', 'invalid_credentials');
        });
      });

      it('should require credentails', function() {
        return request
        .post(config.api.routes.oauth)
        .send({
          'grant_type': 'password',
          'client_id': config.oauth.client.id,
          'client_secret': config.oauth.client.secret
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .then(function (res) {
          var json = JSON.parse(res.text);
          json.should.have.property('error', 'invalid_request');
        });
      });

  });

});

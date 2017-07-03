/* global before */
'use strict';

require('should');
var supertest = require('supertest-as-promised');
var config = require('./environment');
var util = require('./util');
var request = supertest(config.api.url);

var token = null;
var routes = config.api.routes;

describe('API Publisher endpoint', function() {

  this.timeout(config.longTimeout); // increase mocha default timeout

  before(function(done) {
      util.oauth()
      .then(function(res) {
          token = res;
          done();
      });
  });

  function createPublisher(email, password, statusCode) {
    password = password || 'abcde1234#';
    statusCode = statusCode || 200;

    return request
    .post(routes.publisher)
    .set('email', email)
    .set('user-first-name', 'jane')
    .set('user-last-name', 'doe')
    .set('user-country', 'Belgium')
    .set('user-password', password)
    .expect(statusCode)
    .expect('Content-Type', /json/);
  }

  describe('Create Publisher', function() {

      it('should have a valid user in the test environment', function() {
        config.should.have.property('user');
        config.user.should.have.property('username');
        config.user.should.have.property('password');
      });

      it('should create a publisher', function() {
        createPublisher('jane.doe' + (new Date().getTime()) + '-' + Math.ceil((Math.random() * 100000)) + '@acme.com');
      });

      it('should create a publisher and allow the publisher to login', function() {
        var email = 'jane.doe' + (new Date().getTime()) + '-' + Math.ceil((Math.random() * 100000)) + '@acme.com';
        var password = 'abcde1234#';
        return createPublisher(email, password)
          .then(function() {
            // do login
            return request
            .post(config.api.routes.oauth)
            .send({
                'grant_type': 'password',
                'client_id': config.oauth.client.id,
                'client_secret': config.oauth.client.secret,
                'username':  email,
                'password': password
            })
            .expect(200)
            .expect('Content-Type', /json/);
          });
      });

      it('should not allow duplicate email address', function() {
          var email = 'jane.doe' + (new Date().getTime()) + '-' + Math.ceil((Math.random() * 100000)) + '@acme.com';
          var password = 'abcde1234#';
          return createPublisher(email)
          .then(function() {
            return createPublisher(email, password, 401);
          })
          .then(function(res) {
            var json = JSON.parse(res.text);
            json.status.code.should.equal('401');
            json.status.error.should.equal(true);
          });
      });

      it('should return a publisher', function() {
        return request
        .get(routes.publisher)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function(res){
            var json = JSON.parse(res.text);
            json.body.should.have.property('user_profile');
            json.body.should.have.property('company_profile');

            var user = json.body.user_profile;
            var company = json.body.company_profile;

            user.should.have.property('user_hash');
            user.should.have.property('first_name');
            user.should.have.property('last_name');
            user.should.have.property('email');
            company.should.have.property('pash');
        });
      });

  });

});

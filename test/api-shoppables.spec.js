/* global before */
'use strict';

var supertest = require('supertest-as-promised');
var should    = require('should');
var config    = require('./environment');
var request   = supertest(config.api.url);
var util      = require('./util');

var token     = null;
var routes    = config.api.routes;
var user_hash;
var api_key;

function createShoppable() {
    return request
    .post(routes.shoppables)
    .set('Authorization', 'Bearer ' + token)
    .set('api-key', api_key)
    .set('user-hash', user_hash)
    .set('type', 'video')
    .set('url', 'http://i.ytimg.com/vi/5HZdyUUhzXU/hqdefault.jpg')
    .set('item-title', 'Cozy Night In - ' + (new Date().getTime()) + '-' + Math.ceil((Math.random() * 100000)))
    .expect(200)
    .expect('Content-Type', /json/);
}

describe('API Shoppable endpoint', function() {

  this.timeout(config.longTimeout); // increase mocha default timeout

  before(function(done) {
    // get OAuth access token

    util.oauth()
    .then(function(res) {
        token = res;
        return res;
    })
    .then(function() {
      return util.getPublisher();
    })
    .then(function(publisher) {
      user_hash = publisher.user_profile.user_hash;
      api_key = publisher.company_profile.api_key;
      done();
    });
  });

  describe('create a Shoppable', function() {

      it('should return an item hash', function() {

        return createShoppable()
        .then(function (res) {
          var shoppable, body, status;

          shoppable = JSON.parse(res.text);
          shoppable.should.have.property('status');
          shoppable.should.have.property('body');

          status = shoppable.status;
          status.should.have.property('code', 200);
          status.should.have.property('error', false);
          status.should.have.property('text', 'success');

          body = shoppable.body;
          body.should.have.property('item_hash');
          body.should.have.property('container_id');
        });
      });

  });

  describe('delete a Shoppable', function() {

      it('should delete an item', function() {
        // create shoppable
        return createShoppable()
        .then(function (res) {
            var body = JSON.parse(res.text).body;
            // delete shoppable
            return request
            .delete(routes.shoppables)
            // @TODO limit to required request headers
            .set('Authorization', 'Bearer ' + token)
            .set('api-key', api_key)
            .set('user-hash', user_hash)
            .set('item-hash', body.item_hash)
            .expect(200)
            .expect('Content-Type', /json/);
        })
        // check delete response
        .then(function (res) {
            var status = JSON.parse(res.text).status;
            status.should.have.property('error', false);
            status.should.have.property('text', 'success');
        });

      });
  });

  describe('list Shoppables', function() {

      it('should return shoppables listings based on the publisher_hash', function() {
        // user login
        return request
        .get(routes.shoppables)
        // @TODO limit to required request headers
        .set('Authorization', 'Bearer ' + token)
        .set('api-key', api_key)
        .set('user-hash', user_hash)
        .expect(200)
        .expect('Content-Type', /json/)
        // list shoppables
        .then(function (res) {
            var status, shoppables;

            status = JSON.parse(res.text).status;
            status.should.have.property('code', 200);
            status.should.have.property('error', false);
            status.should.have.property('text', 'success');

            shoppables = JSON.parse(res.text).body.shoppable;
            shoppables.should.be.instanceof(Array);
        });

      });

  });

  describe('update a Shoppable', function() {

      it('should add hotspots', function() {

        return request
        .post(routes.shoppables)
        // @TODO limit to required request headers
        .set('Authorization', 'Bearer ' + token)
        .set('api-key', api_key)
        .set('user-hash', user_hash)
        .set('type', 'video')
        .set('item-title', 'Cozy Night In - ' + (new Date().getTime()) + '-' + Math.ceil((Math.random() * 100000)))
        .expect(200)
        .expect('Content-Type', /json/)
        // update shoppable with hotspots
        .then(function (res) {
            var body = JSON.parse(res.text).body;
            var item_hash = body.item_hash;
            var shoppable = {
                  'shoppable': {
                      'detail': {
                        'banners': [],
                        'products': [{
                            'details': {
                                'sku': '5NM-PROD54800013-111',
                                'name': 'Lash Power Mascara -- 1',
                                'currency': 'usd'
                            },
                            'hotspots': {
                                'at': 53.900001525879,
                                'threshold': 1,
                                'top': 50,
                                'left': 40
                            }
                          }]
                      }
                  }
              };
            // update shoppable
            return request
            .put(routes.shoppables)
            // @TODO limit to required request headers
            .set('Authorization', 'Bearer ' + token)
            .set('api-key', api_key)
            .set('user-hash', user_hash)
            .set('type', 'video')
            .set('item-hash', item_hash)
            .send(shoppable)
            //.expect(200)
            .expect('Content-Type', /json/);
        })
        // check update response
        .then(function (res) {
            var status = JSON.parse(res.text).status;
            status.should.have.property('code', 200);
            status.should.have.property('error', false);
            status.should.have.property('text', 'success');
        });

      });
  });

  describe('Image upload', function() {

    it('should upload an image', function(done) {

        var request = require('request');
        var fs = require('fs');
        var path = require('path');
        var fileName = '1024x1024.png';
        var filePath = path.join(__dirname, 'assets', fileName);
        var img = fs.readFileSync(filePath);

        var options = {
            method: 'POST',
            url: config.api.url + routes.shoppablesUpload,
            headers: {
                'authorization': 'Bearer ' + token,
                'content-type': 'multipart/form-data; boundary=---011000010111000001101001' },
            formData: {
                file: {
                    value: img,
                    options: { filename: fileName, contentType: null }
                }
            }
        };

        request(options, function (error, response, body) {
            should.not.exist(error);

            response.statusCode.should.equal(200);
            var json = JSON.parse(body);
            json.should.have.property('status');
            json.should.have.property('body');

            json.status.should.have.property('code', 200);
            json.status.should.have.property('error', false);
            json.status.should.have.property('text', 'success');

            json.body.should.have.property('image_url');

            done();
        });

    });

  });

});

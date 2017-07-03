'use strict';

var config = require('./environment');
var supertest = require('supertest-as-promised');
var request = supertest(config.api.url);
var promise = require('bluebird');
var token;

function oauth() {
    return new promise(function(resolve, reject) {

        if (token) {
            resolve(token);
        }
        request
        .post(config.api.routes.oauth)
        .send({
            'grant_type': 'password',
            'client_id': config.oauth.client.id,
            'client_secret':config.oauth.client.secret,
            'username':  config.user.username,
            'password': config.user.password
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function (res) {
            var json = JSON.parse(res.text);
            token = json.access_token;
            resolve(json.access_token);
        })
        .catch(function(err) {
            reject(err);
        });
    });
}

function getPublisher() {
    return new promise(function(resolve, reject) {

      oauth()
      .then(function() {
        return request
        .get(config.api.routes.publisher)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function (res) {
            resolve(JSON.parse(res.text).body);
        });
      })
      .catch(function(err) {
          reject(err);
      });

    });
}


module.exports = {
    oauth: oauth,
    getPublisher: getPublisher
};

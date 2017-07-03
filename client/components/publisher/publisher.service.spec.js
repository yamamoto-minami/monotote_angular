/* global xit */
'use strict';

describe('Service: Publisher', function () {

  // load the service's module
  beforeEach(module('cmp.publisher'));

  var $httpBackend,
      authRequestHandler,
      createPublisher,
      credentials,
      config,
      user;

  // Initialize the service and a mock scope
  beforeEach(inject(function ($injector) {
    var Publisher;
    config = $injector.get('cmp.config');
    user = {
      'user_hash': 'the-user-hash',
      'first_name': 'first-name',
      'last_name': 'last-name'
    };

    $httpBackend = $injector.get('$httpBackend');
    Publisher = $injector.get('Publisher');

    authRequestHandler = $httpBackend.when('GET', config.apiUrl + '/publisher')
      .respond({
	    'status': {
	        'code': 200,
	        'error': false,
	        'text': 'success'
	    },
	    'body': {
	        'publisher_user': user,
	        'publisher_company': {
            'pash': 'the-pash',
            'name': 'the-company-name.'
	        }
	    }
	});

    credentials = {
      email: 'the email',
      password: 'the password'
    };

    createPublisher = function() {
      //console.log('createPublisher');
      return Publisher;
    };

  }));

  xit('should return publisher profile', function () {
    var publisher = createPublisher();
    var thenCalled = false;
    var errorCalled = false;
    var callbackCalled = false;
    var response = false;
    var callback = function() {
      callbackCalled = true;
    };

    $httpBackend.expectGET(config.apiUrl + '/publisher');

    publisher.profile('the-id', callback)
    .then(function(data) {
      thenCalled = true;
      response = data;
    })
    .catch( function() {
      errorCalled = true;
    });

    // trigger backend response
    $httpBackend.flush();

    // promise then function should have been called
    expect(thenCalled).toBe(true);
    // promise error function should not have been called
    expect(errorCalled).toBe(false);
    // callback function should have been called
    expect(callbackCalled).toBe(true);
    // promise then function should return the user
    expect(response).toEqual({
      hash: user.user_hash,
      firstName: user.first_name,
      lastname: user.last_name
    });
  });


   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
});


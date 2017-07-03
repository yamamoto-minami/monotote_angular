/* global xdescribe */
'use strict';

xdescribe('Service: Auth', function () {

  // load the service's module
  beforeEach(module('cmp.auth'));

  var $httpBackend,
      authRequestHandler,
      publisherRequestHandler,
      createAuth,
      credentials,
      user,
      config;

  // Initialize the service and a mock scope
  beforeEach(inject(function ($injector) {
    var Auth;

    config = $injector.get('cmp.config');
    $httpBackend = $injector.get('$httpBackend');
    user = {
      'user_hash': 'the-user-hash',
      'first_name': 'first-name',
      'last_name': 'last-name'
    };

    authRequestHandler = $httpBackend.when('POST', config.apiUrl + '/auth/publisher')
      .respond({
        'status': {
            'code': 200,
            'error': false,
            'text': 'success'
        },
        'body': {
            'user': {
              'user_company_hash': 'user-company-hash',
              'user_hash': 'user-hash',
              'user_first_name': 'user-first-name',
              'user_last_name': 'user-last-name'
            }
        }
    });

    publisherRequestHandler = $httpBackend.when('GET', config.apiUrl + '/publisher')
      .respond({
	    'status': {
	        'code': 200,
	        'error': false,
	        'text': 'success'
	    },
	    'body': {
	        'publisher_user': user,
	        'publisher_company': {}
	    }
	});
    credentials = {
      email: 'the email',
      password: 'the password'
    };

    Auth = $injector.get('Auth');

    createAuth = function() {
      return Auth;
    };

  }));


  it('should fetch authentication token', function() {
    $httpBackend.expectPOST(config.apiUrl + '/auth/publisher');
    $httpBackend.expectGET(config.apiUrl + '/publisher');
    createAuth().login(credentials);
    $httpBackend.flush();
  });

  it('should allow publisher login', function () {

    // current user should not exist
    var auth = createAuth();
    var thenCalled = false;
    var errorCalled = false;
    var callbackCalled = false;
    var callback = function(){ callbackCalled = true; };

    expect(auth.getCurrentUser()).toEqual({});

    // do login
    auth.login({
      email: 'the email',
      password: 'the password'
    }, callback)
    .then(function() {
      thenCalled = true;
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

    // @TODO test Auth cookieStore usage
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});

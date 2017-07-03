'use strict';

var config = require('../../test/environment');

describe('Profile View', function() {
  var page,
    loginPage,
    loginComplete = false;

  beforeEach(function(cb) {
    if (!loginComplete) {
        loginPage = require('../login/login.po');
        page = require('./profile.po');
        browser.get('/login');
        loginPage.email.clear().sendKeys(config.user.username);
        loginPage.password.clear().sendKeys(config.user.password);
        loginPage.login.click()
        .then(function() {
            loginComplete = true;
            browser.sleep(1000);
            cb();
         });
    } else {
        browser.get('/profile');
        cb();
    }
  });

  it('should profile input fields', function() {
    browser.get('/profile');

    expect((page.userfirstname).isPresent()).toBe(true);
    expect((page.userlastname).isPresent()).toBe(true);
    expect((page.useremail).isPresent()).toBe(true);
    //expect((page.userprofileimg).isPresent()).toBe(true);
    expect((page.userstreet).isPresent()).toBe(true);
    expect((page.usercity).isPresent()).toBe(true);
    expect((page.userpostalcode).isPresent()).toBe(true);
    expect((page.userstate).isPresent()).toBe(true);
    expect((page.userphone).isPresent()).toBe(true);
    expect((page.usercountrycode).isPresent()).toBe(true);
    expect((page.companyname).isPresent()).toBe(true);
    expect((page.companywebsite).isPresent()).toBe(true);
    expect((page.companyphone).isPresent()).toBe(true);
    expect((page.companywebstore).isPresent()).toBe(true);
    expect((page.companystreet).isPresent()).toBe(true);
    expect((page.companycity).isPresent()).toBe(true);
    expect((page.companypostalcode).isPresent()).toBe(true);
    expect((page.companystate).isPresent()).toBe(true);

  });

});

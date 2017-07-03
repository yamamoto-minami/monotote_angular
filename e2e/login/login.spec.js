'use strict';

var config = require('../../test/environment');

describe('Login View', function() {
  var page;

  beforeEach(function() {
    page = require('./login.po');
    browser.get('/login');
  });

  it('should navigate to login page', function() {
    expect((page.email).isPresent()).toBe(true);
    expect((page.password).isPresent()).toBe(true);
    expect((page.login).isPresent()).toBe(true);
    expect((page.emailHelp).isPresent()).toBe(true);
    expect((page.passwordHelp).isPresent()).toBe(true);
  });

  it('should require user email and password', function() {
    page.email.clear();
    page.password.clear();
    page.login.click().then(function() {
      expect(browser.getCurrentUrl()).toMatch(/\/login/);
      expect(page.emailHelp.isDisplayed()).toBeTruthy();
      expect(page.passwordHelp.isDisplayed()).toBeTruthy();
    });
  });

  it('should allow valid login credentials', function() {
    page.email.clear().sendKeys(config.user.username);
    page.password.clear().sendKeys(config.user.password);
    page.login.click().then(function() {
      browser.sleep(250);
      expect(browser.getCurrentUrl()).toMatch(/\/tagging/);
    });
  });

});

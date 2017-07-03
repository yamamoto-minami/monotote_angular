
/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var LoginPage = function() {
  this.email = element(by.model('user.email'));
  this.password = element(by.model('user.password'));
  this.login = element(by.css('button[type="submit"]'));
  this.emailHelp = element(by.css('[ng-show="loginForm.loginForm_email.$error.required"]'));
  this.passwordHelp = element(by.css('[ng-show="loginForm.loginForm_password.$error.required"]'));
};

module.exports = new LoginPage();

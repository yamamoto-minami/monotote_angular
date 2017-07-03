
/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var ProfilePage = function() {
    this.userfirstname = element(by.model('profile.user.first_name'));
    this.userlastname = element(by.model('profile.user.last_name'));
    this.useremail = element(by.model('profile.user.email'));
    this.userprofileimg = element(by.model('profile.user.image'));
    this.userstreet = element(by.model('profile.user.street'));
    this.usercity = element(by.model('profile.user.city'));
    this.userpostalcode = element(by.model('profile.user.postalcode'));
    this.userstate = element(by.model('profile.user.state'));
    this.userphone = element(by.model('profile.user.phone'));
    this.usercountrycode = element(by.model('profile.user.country'));
    this.companyname = element(by.model('profile.company.name'));
    this.companywebsite = element(by.model('profile.company.website'));
    this.companyphone = element(by.model('profile.company.phone'));
    this.companywebstore = element(by.model('profile.company.webstore'));
    this.companystreet = element(by.model('profile.company.street'));
    this.companycity = element(by.model('profile.company.city'));
    this.companypostalcode = element(by.model('profile.company.postalcode'));
    this.companystate = element(by.model('profile.company.state'));
};

module.exports = new ProfilePage();

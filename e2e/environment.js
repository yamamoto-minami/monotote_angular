var _ = require('lodash');

var webServerDefaultPort = 9000;

// use env below for selenium hub
// export SELENIUM_URL='http://192.168.22.10:4444/wd/hub'
// export HTTP_HOST='192.168.22.1'
// export HTTP_PORT='9000'
//
var seleniumAddress = process.env.SELENIUM_URL;
var useSeleniumHub = typeof seleniumAddress !== 'undefined';

var env = {

  // Default http port to host the web server
  webServerDefaultPort: webServerDefaultPort,

  // A base URL for your application under test.
  baseUrl:
    'http://' + (process.env.HTTP_HOST || 'localhost') +
          ':' + (process.env.HTTP_PORT || webServerDefaultPort),

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: 110000,

  // list of files / patterns to load in the browser
  specs: [
    'e2e/**/*.spec.js'
  ],

  // Patterns to exclude.
  exclude: [],

  // ----- The test framework -----
  framework: 'jasmine2',

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    // add jasmine spec reporter
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: false
    }));
  },

  // ----- Options to be passed to minijasminenode -----
  //
  // See the full list at https://github.com/juliemr/minijasminenode
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    showColors: true,
    silent: true,
    print: function() {}
  }
};

var hub = {
  // The address of a running selenium server.
  seleniumAddress : process.env.SELENIUM_URL,

  multiCapabilities: [
    //{
    //  'browserName': 'internet explorer',
    //  'version': '10',
    //  'platform': 'WINDOWS'
    //},
    //{
    //  'browserName': 'internet explorer',
    //  'version': '9',
    //  'platform': 'WINDOWS'
    //},
    //{
    //  'browserName': 'firefox',
    //  'platform': 'WINDOWS'
    //},
    {
      'browserName': 'chrome',
      'platform': 'MAC'
    }
  ]
};

var single = {

  // If true, only chromedriver will be started, not a standalone selenium.
  // Tests for browsers other than chrome will not run.
  directConnect: true,
  //
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  }
};

module.exports = _.merge(env, useSeleniumHub ? hub : single);

// convert.js

const seleniumConverter = require('./engine.js');

let template = `
const assert = require('assert');
const path = require('path');
const test = require('selenium-webdriver/testing');
const webdriver = require('selenium-webdriver'),
By = webdriver.By,
until = webdriver.until;


describe(path.basename(__filename), function() {
  // --enter test case name (ie. 'example test case')
  test.it('{-name-}', function(done) {
    this.timeout(0);
    var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

  
    {-actions-}
    done();
    driver.close();
  });
})
`;
seleniumConverter('tests/input_html_tests','tests/output_js_tests', template);



const assert = require('assert');
const path = require('path');
const test = require('selenium-webdriver/testing');
const webdriver = require('selenium-webdriver'),
By = webdriver.By,
until = webdriver.until;


describe(path.basename(__filename), function() {
  // --enter test case name (ie. 'example test case')
  test.it('search_Stomach', function(done) {
    this.timeout(0);
    var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

  
    driver.get("http://localhost:3000"+"/");
		driver.findElement(By.id("keywords")).click();
		driver.sleep('3000');
		driver.findElement(By.id("keywords")).sendKeys('Stomach');
		driver.sleep('3000');
		driver.findElement(By.id("search")).click();
		driver.sleep('6000');
		driver.findElement(By.linkText("Fundus Of Stomach")).getText().then(text=> {
			assert(text == 'Fundus Of Stomach');
			done();
		});
		
    done();
    driver.close();
  });
})

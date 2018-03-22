
const assert = require('assert');
const path = require('path');
const test = require('selenium-webdriver/testing');
const webdriver = require('selenium-webdriver'),
By = webdriver.By,
until = webdriver.until;


describe(path.basename(__filename), function() {
  // --enter test case name (ie. 'example test case')
  test.it('search_blood', function(done) {
    this.timeout(0);
    var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

  
    driver.get("http://localhost:3000"+"/");
		driver.findElement(By.id("keywords")).click();
		driver.findElement(By.id("keywords")).sendKeys('blood');
		driver.sleep('5000');
		driver.findElement(By.id("search")).click();
		driver.sleep('5000');
		driver.findElement(By.linkText("Peripheral Whole Blood")).getText().then(text=> {
			assert(text == 'Peripheral Whole Blood');
			done();
		});
		driver.sleep('5000');
		
    done();
    driver.close();
  });
})

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
var consoleLog = require(__dirname + '/../log/consoleLog.js');
var consoleErrorLog = require(__dirname + '/../log/consoleErrorLog.js');
var ddLogMetric = require(__dirname + '/../log/datadogLogMetric.js');
var ddLogEvent = require(__dirname + '/../log/datadogLogEvent.js');
var csvLog = require(__dirname + '/../log/csvLog.js');
var driver = null;
var tags = null;
var config = require(__dirname + '/../privateconfig.json');
var wd_browser = config.WEBDRIVER.BROWSER;

var getPrice = function(price){
    var st = price;
    st = st.replace("'", '')
    var array = st.split(" ");
    var price = parseFloat(array[1]);
    return price;
}

var getURL = function(dateFrom, dateTo, tags){
    var url = 'https://www.swiss.com/ch/de/Book/Flight?openJaw=true';
    return url;
}

var grapPrice = function(dateFrom, dateTo, tags1) {
    tags = tags1;
    var url = getURL(dateFrom, dateTo, tags);

    try {
        driver = new webdriver.Builder().forBrowser(wd_browser).build();
        driver.manage().deleteAllCookies();
        driver.get(url);
        driver.manage().window().setSize(1200, 900);

        swiss_el01 = driver.findElement(webdriver.By.id('open_jaw_from_0'));
        //swiss_el01.sendKeys('Zürich (ZRH)');
        swiss_el01.sendKeys('ZRH');

        swiss_el02 = driver.findElement(webdriver.By.id('open_jaw_to_0'));
        //swiss_el02.sendKeys('Tampa (TPA)');
        swiss_el02.sendKeys(tags.destinationTo);

        swiss_el03 = driver.findElement(webdriver.By.id('open_jaw_date_0'));
        swiss_el03.sendKeys(tags.dateTo);

        swiss_el04 = driver.findElement(webdriver.By.id('open_jaw_from_1'));
        //swiss_el04.sendKeys('Miami (MIA)');
        swiss_el04.sendKeys(tags.destinationFrom);

        swiss_el05 = driver.findElement(webdriver.By.id('open_jaw_to_1'));
        //swiss_el05.sendKeys('Zürich (ZRH)');
        swiss_el05.sendKeys('ZRH');

        swiss_el06 = driver.findElement(webdriver.By.id('open_jaw_date_1'));
        swiss_el06.sendKeys(tags.dateFrom);

        swiss_el07 = driver.findElement(webdriver.By.id('SearchPaxClassAirlineModel_PaxSelectionModel_SearchCriteria_Adults'));
        swiss_el07.sendKeys(tags.parents);

        swiss_el08 = driver.findElement(webdriver.By.id('SearchPaxClassAirlineModel_PaxSelectionModel_SearchCriteria_Children'));
        swiss_el08.sendKeys(tags.childrens);

        // swiss_el08_1 = driver.wait(until.elementLocated({
        //     xpath: "//div[@id='main-content']/div[2]/form/div/div/fieldset/button"
        // }), 20000);

        swiss_el09 = driver.findElement({xpath: "//form/div/div/fieldset/button"});
        driver.executeScript("arguments[0].scrollIntoView();",swiss_el09);
        // swiss_el09.click();
        driver.actions().click(swiss_el09).perform()

        swiss_el10 = driver.wait(until.elementLocated({
            xpath: "//button[@type='button']"
        }), 60000);
        swiss_el11 = driver.findElement({
            xpath: "//button[@type='button']"
        }).click();
        swiss_el12 = driver.wait(until.elementLocated({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }), 60000);
        swiss_el13 = driver.findElement({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }).click();
        swiss_el14 = driver.wait(until.elementLocated({
            xpath: "//button[@type='button']"
        }), 60000);
        swiss_el15 = driver.findElement({
            xpath: "//button[@type='button']"
        }).click();
        swiss_el16 = driver.wait(until.elementLocated({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }), 60000);
        swiss_el17 = driver.findElement({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }).click();
        swiss_el18 = driver.wait(until.elementLocated({
            css: "footer.booking-cart-grand-quick-summary > span.booking-cart-summary-amount"
        }), 40000);
        swiss_el19 = driver.findElement({
            css: "footer.booking-cart-grand-quick-summary > span.booking-cart-summary-amount"
        });
        swiss_el20 = swiss_el19.getText().then(function(swiss_el20) {
            consoleLog(tags, 'Price = ' + getPrice(swiss_el20.toString()));
            csvLog(tags, getPrice(swiss_el20.toString()));
            ddLogMetric(tags, getPrice(swiss_el20.toString()));
        });
    } catch (err) {
        consoleErrorLog(tags, err);
        ddLogEvent(tags, 'error', 'normal', err);
    }finally{
        driver.quit();
    }
}

process.on('uncaughtException', function (err) {
    consoleErrorLog(null, err);
    driver.quit();
});

module.exports = grapPrice;

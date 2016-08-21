var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
var consoleLog = require(__dirname + '/../log/consoleLog.js');
var consoleErrorLog = require(__dirname + '/../log/consoleErrorLog.js');
var ddLogMetric = require(__dirname + '/../log/datadogLogMetric.js');
var ddLogEvent = require(__dirname + '/../log/datadogLogEvent.js');
var csvLog = require(__dirname + '/../log/csvLog.js');
var driver = null;
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
    var url1 = 'https://www.swiss.com/ch/de/Book/Outbound/ZRH-MIA/from-2017-04-28/to-2017-05-12/adults-4/children-2/infants-0/class-economy/al-LX/';

    var url = 'https://www.swiss.com/ch/de/Book/Outbound/';
    url += 'ZRH-' + tags.destinationTo;
    url += '/from-' + dateTo.year + '-' + dateTo.month + '-' + dateTo.day;
    url += '/to-' + dateFrom.year + '-' + dateFrom.month + '-' + dateFrom.day;
    url += '/adults-' + tags.parents + '/children-' + tags.childrens
    url += '/infants-0/class-economy/al-LX/'
    return url;
}

var grapPrice = function(dateFrom, dateTo, tags) {
    var url = getURL(dateFrom, dateTo, tags);

    driver = new webdriver.Builder().forBrowser(wd_browser).build();
    try {
        driver.manage().deleteAllCookies();
        driver.get(url);
        driver.manage().window().setSize(1200, 900);

        swisse_el2 = driver.wait(until.elementLocated({
            xpath: "//button[@type='button']"
        }), 40000);
        swisse_el3 = driver.findElement({
            xpath: "//button[@type='button']"
        }).click();
        swisse_el4 = driver.wait(until.elementLocated({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }), 40000);
        swisse_el5 = driver.findElement({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }).click();
        swisse_el6 = driver.wait(until.elementLocated({
            xpath: "//button[@type='button']"
        }), 40000);
        swisse_el8 = driver.findElement({
            xpath: "//button[@type='button']"
        }).click();
        swisse_el9 = driver.wait(until.elementLocated({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }), 40000);
        swisse_el10 = driver.findElement({
            xpath: "//div[@id='stickybasket']/div/div/div[4]/div/button"
        }).click();
        swisse_el10_5 = driver.wait(until.elementLocated({
            css: "footer.booking-cart-grand-quick-summary > span.booking-cart-summary-amount"
        }), 40000);
        swisse_el11 = driver.findElement({
            css: "footer.booking-cart-grand-quick-summary > span.booking-cart-summary-amount"
        });
        swisse_el12 = swisse_el11.getText().then(function(swisse_el12) {
            consoleLog(tags, 'Price = ' + getPrice(swisse_el12.toString()));
            csvLog(tags, getPrice(swisse_el12.toString()));
            ddLogMetric(tags, getPrice(swisse_el12.toString()));
        });
    } catch (ex) {
        consoleErrorLog(tags, ex);
        ddLogEvent(tags, 'error', 'normal', ex.message);
    }finally{
        driver.quit();
    }
}

process.on('uncaughtException', function (err) {
  consoleErrorLog(null, err);
  driver.quit();
})

module.exports = grapPrice;

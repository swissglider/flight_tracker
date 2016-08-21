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
    var url1 = 'https://www.ebookers.ch/Flights-Search?trip=roundtrip&leg1=from:ZRH,to:MIA,departure:28.04.2017TANYT&leg2=from:MIA,to:ZRH,departure:12.05.2017TANYT&passengers=children:2[8;9],adults:4,seniors:0,infantinlap:Y&options=maxhops%3A0%2Ccarrier%3ALX&mode=search'

    var url = 'https://www.ebookers.ch/Flights-Search';
    url += '?trip=roundtrip';
    url += '&leg1=from:ZRH,to:' + tags.destinationTo + ',departure:' + dateTo.day + '.' + dateTo.month + '.' + dateTo.year + 'TANYT';
    url += '&leg2=from:' + tags.destinationFrom + ',to:ZRH,departure:' + dateFrom.day + '.' + dateFrom.month + '.' + dateFrom.year + 'TANYT';
    url += '&passengers=children:' + tags.childrens + '[8;9],adults:' + tags.parents + ',seniors:0,infantinlap:Y';
    url += '&options=maxhops%3A0%2Ccarrier%3ALX&mode=search';
    return url;
}

var grapPrice = function(dateFrom, dateTo, tags) {
    var url = getURL(dateFrom, dateTo, tags);

    driver = new webdriver.Builder().forBrowser(wd_browser).build();
    try {
        driver.manage().deleteAllCookies();
        driver.get(url);
        driver.manage().window().setSize(1200, 900);

        ebookers_el1 = driver.wait(until.elementLocated({
            xpath: "//div[2]/div/button"
        }), 80000);
        ebookers_el2 = driver.findElement({
            xpath: "//div[2]/div/button"
        }).click().then(function(ebookers_el3) {
            var handlePromise = driver.getAllWindowHandles();
            handlePromise.then(function(handles) {
                parentHandle = handles[0];
                var popUpHandle = handles[1];
                try {
                    driver.switchTo().window(popUpHandle);
                    ebookers_el3 = driver.wait(until.elementLocated({
                        css: "#trip-summary > #totalContainer > #tsTotal > div.trip-totals > div.col.right > #tripTotal"
                    }), 80000);
                    ebookers_el4 = driver.findElement({
                        css: "#trip-summary > #totalContainer > #tsTotal > div.trip-totals > div.col.right > #tripTotal"
                    });
                    ebookers_el5 = ebookers_el4.getText().then(function(ebookers_el5) {
                        consoleLog(tags, 'Price = ' + getPrice(ebookers_el5.toString()));
                        csvLog(tags, getPrice(ebookers_el5.toString()));
                        ddLogMetric(tags, getPrice(ebookers_el5.toString()));
                    });
                } catch (ex) {
                    ddLogEvent(tags, 'error', 'normal', ex.message);
                }
                driver.close();
                driver.switchTo().window(parentHandle);
            });
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

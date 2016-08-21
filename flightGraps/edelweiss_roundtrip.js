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
    //     var url1 = 'https://booking.flyedelweiss.com/WKOnline/AirLowFareSearchExternal.do?lang=de&flexibleSearch=true&followAction=AirLowFareSearch&guestTypeBeans[0].gstTypeCount[0]=1&guestTypes[0].amount=4&guestTypes[0].type=ADT&guestTypes[1].type=CHD&guestTypes[1].amount=2&outboundOption.departureDay=28&outboundOption.departureMonth=4&outboundOption.departureYear=2017&outboundOption.departureTime=NA&outboundOption.destinationLocationCode=TPA&outboundOption.originLocationCode=ZRH&inboundOption.departureDay=12&inboundOption.departureMonth=5&inboundOption.departureTime=NA&inboundOption.departureYear=2017&inboundOption.destinationLocationCode=ZRH&inboundOption.originLocationCode=TPA&searchType=FARE&tripType=RT';

    var url = 'https://booking.flyedelweiss.com/WKOnline/AirLowFareSearchExternal.do';
    url += '?lang=de&flexibleSearch=true&followAction=AirLowFareSearch&guestTypeBeans[0].gstTypeCount[0]=1';
    url += '&guestTypes[0].type=ADT&guestTypes[0].amount=' + tags.parents;
    url += '&guestTypes[1].type=CHD&guestTypes[1].amount=' + tags.childrens;
    url += '&outboundOption.departureDay=' + dateTo.day;
    url += '&outboundOption.departureMonth=' + dateTo.month;
    url += '&outboundOption.departureYear=' + dateTo.year;
    url += '&outboundOption.departureTime=NA';
    url += '&outboundOption.destinationLocationCode=' + tags.destinationTo;
    url += '&outboundOption.originLocationCode=ZRH';
    url += '&inboundOption.departureDay=' + dateFrom.day;
    url += '&inboundOption.departureMonth=' + dateFrom.month;
    url += '&inboundOption.departureTime=NA';
    url += '&inboundOption.departureYear=' + dateFrom.year;
    url += '&inboundOption.destinationLocationCode=ZRH';
    url += '&inboundOption.originLocationCode=' + tags.destinationFrom;
    url += '&searchType=FARE&tripType=RT';
    return url;
}

var grapPrice = function(dateFrom, dateTo, tags) {
    var url = getURL(dateFrom, dateTo, tags);

    driver = new webdriver.Builder().forBrowser(wd_browser).build();
    try {
        driver.manage().deleteAllCookies();
        driver.get(url);
        driver.manage().window().setSize(1200, 900);

        edelweiss_el0 = driver.wait(until.elementLocated(By.id("airSelection_SummaryBot_Bottom_totalPrice")), 40000);
        edelweiss_el1 = driver.findElement(By.id("airSelection_SummaryBot_Bottom_totalPrice"));
        edelweiss_el2 = edelweiss_el1.getText().then(function(edelweiss_el2) {
            consoleLog(tags, 'Price = ' + getPrice(edelweiss_el2.toString()));
            csvLog(tags, getPrice(edelweiss_el2.toString()));
            ddLogMetric(tags, getPrice(edelweiss_el2.toString()));
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

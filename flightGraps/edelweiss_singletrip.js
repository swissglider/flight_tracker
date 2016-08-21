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

var initTags = function(dateFrom, dateTo, tags) {
  if(tags.destinationTo == 'null' || tags.destinationTo == null || tags.destinationTo == '' || tags.destinationTo == '-'){
    tags.destinationTo = tags.destinationFrom;
    if(tags.dateTo == 'null' || tags.dateTo == null|| tags.dateTo == '-'|| tags.dateTo == ''){
      var date1 = new Date(dateFrom.year +'-'+ dateFrom.month +'-'+ dateFrom.day);
      date1.setDate(date1.getDate()-7);
      dateTo.day = date1.getDate().toString()[1]?date1.getDate().toString():"0"+date1.getDate().toString()[0];
      dateTo.month = ((date1.getMonth()+1).toString()[1]?(date1.getMonth()+1).toString():"0"+(date1.getMonth()+1).toString()[0]);
      dateTo.year = date1.getFullYear().toString();
      dateTo.date = dateTo.day + '.' + dateTo.month + '.' + dateTo.year;
      tags.dateTo = dateTo.date;
    }
  }else if(tags.destinationFrom == 'null' || tags.destinationFrom == null || tags.destinationFrom == '' || tags.destinationFrom == '-'){
    tags.destinationFrom = tags.destinationTo;
    if(tags.dateFrom == 'null' || tags.dateFrom == null|| tags.dateFrom == '-'|| tags.dateFrom == ''){
      var date1 = new Date(dateTo.year +'-'+ dateTo.month +'-'+ dateTo.day);
      date1.setDate(date1.getDate()+7);
      dateFrom.day = date1.getDate().toString()[1]?date1.getDate().toString():"0"+date1.getDate().toString()[0];
      dateFrom.month = ((date1.getMonth()+1).toString()[1]?(date1.getMonth()+1).toString():"0"+(date1.getMonth()+1).toString()[0]);
      dateFrom.year = date1.getFullYear().toString();
      dateFrom.date = dateFrom.day + '.' + dateFrom.month + '.' + dateFrom.year;
      tags.dateFrom = dateFrom.date;
    }
  }
  return {tags:tags,dateTo:dateTo,dateFrom:dateFrom};
}

var grapPrice = function(dateFrom, dateTo, tags) {
    var tagsStruct = initTags(dateFrom, dateTo, tags);
    dateFrom = tagsStruct.dateFrom;
    dateTo = tagsStruct.dateTo;
    tags = tagsStruct.tags;

    var url = getURL(dateFrom, dateTo, tags);

    driver = new webdriver.Builder().forBrowser(wd_browser).build();
    try {
        driver.manage().deleteAllCookies();
        driver.get(url);
        driver.manage().window().setSize(1200, 900);

        edelweiss_el0 = driver.wait(until.elementLocated(By.id("airSelection_SummaryBot_Bottom_totalPrice")), 40000);
        var edelweiss_el1 = null;
        if(tags.flight_direction == 'to'){
          edelweiss_el1 = driver.findElement({css: "td.selectedTab > div > div > span.price"});
        }else {
          edelweiss_el1 = driver.findElement({css: "#bodyBlock_1 > div.flightNav > table.flightNavWrap > tbody > tr > td.calendarTabsArea > table.tabsTable > tbody > tr > td.selectedTab > div > div > span.price"});
        }
        edelweiss_el2 = edelweiss_el1.getText().then(function(edelweiss_el2) {
            consoleLog(tags, 'Price = ' + edelweiss_el2.toString());
            csvLog(tags, edelweiss_el2.toString());
            ddLogMetric(tags, edelweiss_el2.toString());
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

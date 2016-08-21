var async = require("async");
var ProgressBar = require('progress');

var interval = 0 // millisecond
var intervalTime = 0; // millisecond
var intervalTicks = 0; // in unit
var intervalMax = 0; // in unit
var intervalUnit = 'millisecond'; // Unit = millisecond , second, minute, hour

var statusBarInterval = null; //

var statusBarUpdateInterval = null; // statusbar update intevall
var green = '\u001b[42m \u001b[0m';
var red = '\u001b[41m \u001b[0m';

var initStatusTimer = function(newInterval, newIntervalUnit){

    //init intervall
    intervalMax = newInterval;
    intervalTicks = intervalMax/newInterval
    intervalUnit = newIntervalUnit;
    if(intervalUnit == 'millisecond'){
        interval = newInterval;
    } else if (intervalUnit == 'second'){
        interval = newInterval*1000;
    } else if (intervalUnit == 'minute'){
        interval = newInterval*1000*60;
    } else if (intervalUnit == 'hour'){
        interval = newInterval*1000*60*60;
    }
    intervalTime = interval/newInterval;

    //init statusBar
    statusBarInterval = new ProgressBar(
        ':percent [:bar] :current ' + intervalUnit + '(s) over from ' + intervalMax + ' ' + intervalUnit + '(s) to next run', {
      complete: '=',
      incomplete: ' ',
      complete: green,
      incomplete: red,
      width: 30,
      total: intervalMax,
      clear: true,
    });
}

var getTimerLeft = function(callback) {
    statusBarInterval.tick(0);
    statusBarUpdateInterval = setInterval(function() {
        if (statusBarInterval.complete) {
            statusBarInterval.tick(intervalTicks);
            clearInterval(statusBarUpdateInterval);
            callback();
        } else{
            statusBarInterval.tick(intervalTicks);
        }
    }, intervalTime)
};

// Unit = millisecond , second, minute, hour
var startStatusTimer = function(intervalTime, intervalUnit, callFunction){
    initStatusTimer(intervalTime, intervalUnit);
    getTimerLeft(callFunction);
};

module.exports = startStatusTimer;

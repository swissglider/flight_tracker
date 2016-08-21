var async = require("async");
var exec = require('child_process').exec;
var consoleLog = require(__dirname + '/log/consoleLog.js');
var consoleErrorLog = require(__dirname + '/log/consoleErrorLog.js');
var startStatusTimer = require(__dirname + '/statusTimer');
var ddLogEvent = require(__dirname + '/log/datadogLogEvent.js');
var flight_configs = require(__dirname + '/privateconfig.json').FLIGHTS;
var intervall_minutes = require(__dirname + '/privateconfig.json').REQUEST_INTERVALL.Intervall_Minutes;

var getFlights = function(){
    var flight_tags = [];
    for(var i=0;i<flight_configs.length;i++){
            var tmp_tag = flight_configs[i];
            if(!tmp_tag.destinationTo || tmp_tag.destinationTo == '-' || tmp_tag.destinationTo == ''){
                tmp_tag.destinationTo = '-';
                tmp_tag.flight_type = 'single';
                tmp_tag.flight_direction = 'from';
            }
            else if(!tmp_tag.destinationFrom || tmp_tag.destinationFrom == '-' || tmp_tag.destinationFrom == ''){
                tmp_tag.destinationFrom = '-';
                tmp_tag.flight_type = 'single';
                tmp_tag.flight_direction = 'to';
            }
            else{
                tmp_tag.flight_type = 'roundtrip';
                tmp_tag.flight_direction = 'to-from';
            }
            flight_tags.push(tmp_tag);
    }
    return flight_tags;
}

var executeFlights = function(tags, callback){
    var el = ' ';
    var args = '';
    for (var x in tags) {
        args += 'tags+++' + x + '+++' + tags[x];
        args += el;
    }
    var result = '';
    var errors = '';
    var child = exec('node ' + __dirname + '/grapFlightPrice.js ' + args);
    child.stdout.on('data', function(data) {
        result += data;
    });
    child.stderr.on('data', function(data) {
        errors += data;
    });
    child.on('close', function(code) {
        if(errors != ''){
            ddLogEvent(tags, 'error', 'normal', errors);
            consoleErrorLog(tags, errors, true);
        }else {
            ddLogEvent(tags, 'success', 'low', result);
            consoleLog(tags, result, true);
        }
        callback();
    });
}

var startGrapping = function(callback1) {
    flight_tags = getFlights();
    var functions = [];
    for(var i = 0; i < flight_tags.length; i++) {
        functions.push(function(callback){executeFlights(this, callback);}.bind(flight_tags[i]));
    }
    async.series(functions, function(err, results) {
        callback1();
    });
}

var startIntervall = function(){
    async.whilst(
        function() {
            return true;
        },
        function(callback) {
            startStatusTimer(parseFloat(intervall_minutes) * 60, 'second', function() {
                startGrapping(callback)
            });
        },
        function(err, n) {
            console.error(n);
            console.error(error);
        }
    );
}

startGrapping(function(){});
setTimeout(startIntervall, parseFloat(intervall_minutes) * 60 * 1000);

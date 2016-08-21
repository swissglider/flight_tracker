// init console args
var myArgs = process.argv.slice(2);
var tags = {};
for(var i=0; i<myArgs.length;i++){
    var arg = myArgs[i].split('+++');
    if(arg.length==3 && arg[0]=='tags'){
        tags[arg[1]] = arg[2];
    }
}

var dateFrom = {
    date: tags.dateFrom,
    day: tags.dateFrom.split('.')[0],
    month: tags.dateFrom.split('.')[1],
    year: tags.dateFrom.split('.')[2]
}

var dateTo = {
    date: tags.dateTo,
    day: tags.dateTo.split('.')[0],
    month: tags.dateTo.split('.')[1],
    year: tags.dateTo.split('.')[2]
}

if (tags.provider == "Swiss" && tags.flight_type == "roundtrip"){
    var grap = require(__dirname + '/flightGraps/swiss_roundtrip.js');
    grap(dateFrom, dateTo, tags);
}

if (tags.provider == "Edelweiss" && tags.flight_type == "roundtrip"){
    var grap = require(__dirname + '/flightGraps/edelweiss_roundtrip.js');
    grap(dateFrom, dateTo, tags);
}

if (tags.provider == "Edelweiss" && tags.flight_type == "single"){
    tags.provider = 'Edelweiss';
    var grap = require(__dirname + '/flightGraps/edelweiss_singletrip.js');
    grap(dateFrom, dateTo, tags);
}

if (tags.provider == "Ebookers" && tags.flight_type == "roundtrip"){
    var grap = require(__dirname + '/flightGraps/ebookers_roundtrip.js');
    grap(dateFrom, dateTo, tags);
}

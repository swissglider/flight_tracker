var csv = require('ya-csv');
var fs = require('fs');

// csv writer init
var writer = csv.createCsvStreamWriter(fs.createWriteStream(__dirname + '/../flight_price.csv', {
    'flags': 'a'
}));

var getNow = function() {
    return new Date().toLocaleString('de-CH', {
        hour12: false
    });
}

var log = function(tags, price) {
    if(price > 0){
        // if(tags.flight_type && tags.flight_type == 'single'){
        //     if(tags.flight_direction == 'to'){
        //         writer.writeRecord([tags.provider, getNow(), price, tags.destinationTo, '', tags.dateTo, '', tags.flight_type, tags.flight_direction]);
        //     }else if (tags.flight_direction == 'from') {
        //         writer.writeRecord([tags.provider, getNow(), price, '', tags.destinationFrom, '', tags.dateFrom, tags.flight_type, tags.flight_direction]);
        //     }
        // }else{
            writer.writeRecord([tags.provider, getNow(), price, tags.destinationTo, tags.destinationFrom, tags.dateTo, tags.dateFrom, tags.flight_type, tags.flight_direction]);
        // }
    }
}

module.exports = log;

var dogapi = require("dogapi");
var csv = require('ya-csv');
var fs = require('fs');
var config = require(__dirname + '/privateconfig.json');

// datadog init
var options = {
    api_key: config.DATADOG.DATADOG_API_KEY,
    app_key: config.DATADOG.DATADOG_APP_KEY,
};
dogapi.initialize(options);

var metrics = [];
var metricsDD = [];
var isReader1Finished = false;
var isReader2Finished = false;
var reader1 = csv.createCsvFileReader('csv_old.csv');
var reader2 = csv.createCsvFileReader('test.csv');
var writer = csv.createCsvStreamWriter(fs.createWriteStream('csv_new.csv', {
    'flags': 'a'
}));

var csvReader = function() {
    reader1.addListener('data', function(data) {
        if (data[4] == 'Miami')
            data[4] = 'MIA'
        if (data[4] == 'Tampa')
            data[4] = 'TPA'
        var tags = {
            provider: data[0],
            destinationTo: data[4],
            destinationFrom: data[4],
            dateTo: "28.04.2017",
            dateFrom: "12.05.2017",
            parents: '4',
            childrens: '2'
        };
        metrics.push({
            date: new Date(data[1]),
            tags: tags,
            price: data[2]
        });
    });
    reader1.addListener('end', function(error) {
        console.log('end reader1');
        isReader1Finished = true;

    });
    reader2.addListener('data', function(data) {
        var tags = {
            provider: data[0],
            destinationTo: data[3],
            destinationFrom: data[4],
            dateTo: data[5],
            dateFrom: data[6],
            parents: '4',
            childrens: '2'
        };
        metrics.push({
            date: new Date(data[1]),
            tags: tags,
            price: data[2]
        });
    });
    reader2.addListener('end', function(error) {
        console.log('end reader2');
        isReader2Finished = true;
    });
}

var waitForReading = function(callback) {
    readerInterval = setInterval(function() {
        if (isReader1Finished && isReader2Finished) {
            clearInterval(readerInterval);
            callback();
        }
    }, 1000)
}

var tagsToDDTags = function(tags) {
    var keys = Object.keys(tags);
    var ddTags = [];
    for (var i = 0; i < keys.length; i++) {
        ddTags.unshift(keys[i] + ':' + tags[keys[i]]);
    }
    return ddTags;
}

//readMetricsFromDD();
csvReader();
waitForReading(function() {
    console.log('start loging');
    metrics.sort(function(a, b) {
        return a.date - b.date;
    });
    for (i = 0; i < metrics.length; i++) {
        writer.writeRecord([metrics[i].tags.provider,
            metrics[i].date.toLocaleString('de-CH', {
                hour12: false
            }),
            metrics[i].price,
            metrics[i].tags.destinationTo,
            metrics[i].tags.destinationFrom,
            metrics[i].tags.dateTo,
            metrics[i].tags.dateFrom
        ]);
        metricsDD.push({
            metric: 'flight_price',
            points: [[metrics[i].date.getTime() / 1000, metrics[i].price]],
            tags: tagsToDDTags(metrics[i].tags),
            host: "flights"
        });
    }
    console.log('start loging to DD');
    dogapi.metric.send_all(metricsDD, function(err, results) {
        if(err)
            console.log(err);
        console.dir(results);
    });
});

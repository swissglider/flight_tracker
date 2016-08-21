var dogapi = require("dogapi");
var config = require(__dirname + '/../privateconfig.json');

// datadog init
var options = {
    api_key: config.DATADOG.DATADOG_API_KEY,
    app_key: config.DATADOG.DATADOG_APP_KEY,
};
ddhost = config.DATADOG.DATADOG_HOST;
dogapi.initialize(options);

var tagsToDDTags = function(tags) {
    var keys = Object.keys(tags);
    var ddTags = [];
    for (var i = 0; i < keys.length; i++) {
        ddTags.unshift(keys[i] + ':' + tags[keys[i]]);
    }
    return ddTags;
}

var log = function(tags, price) {
    if(price > 0)
        dogapi.metric.send('flight_price', price, {host: ddhost,tags: tagsToDDTags(tags)}, function(err, results){});
}

module.exports = log;

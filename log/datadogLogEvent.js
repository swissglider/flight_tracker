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

var log = function(tags, type, priority, message) {
    var title = "Result of Price Request";
    var properties = {
        tags: tagsToDDTags(tags),
        alert_type: type,
        host: ddhost,
        priority: priority,
        source_type_name: tags.provider
    };
    dogapi.event.create(title, message, properties, function(err, res) {});
}

module.exports = log;

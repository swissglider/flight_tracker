var getNow = function() {
    return new Date().toLocaleString('de-CH', {
        hour12: false
    });
}

var log = function(tags, message, isResult){
    if(isResult){
        console.log(message);
    }
    else{
        if(tags.flight_type && tags.flight_type == 'single'){
            if(tags.flight_direction == 'to'){
                var toLog = tags.provider + '-';
                toLog += 'ZRH-' + tags.destinationTo + '-';
                toLog += tags.dateTo + '-';
                toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
                console.log(getNow() + ' - ' + toLog + ' - ' + message);
            }else if (tags.flight_direction == 'from') {
                var toLog = tags.provider + '-';
                toLog += tags.destinationFrom + '-' + 'ZRH-';
                toLog += tags.dateFrom + '-';
                toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
                console.log(getNow() + ' - ' + toLog + ' - ' + message);
            }
        }
        else {
            var toLog = tags.provider + '-';
            toLog += 'ZRH-' + tags.destinationTo + '-' + tags.destinationFrom + '-' + 'ZRH-';
            toLog += tags.dateTo + '-' + tags.dateFrom + '-';
            toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
            console.log(getNow() + ' - ' + toLog + ' - ' + message);
        }
    }
}

module.exports = log;

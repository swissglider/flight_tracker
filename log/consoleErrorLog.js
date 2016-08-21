var getNow = function() {
    return new Date().toLocaleString('de-CH', {
        hour12: false
    });
}

var log = function(tags, message, isResult){
    if(tags == null){
        console.error(message);
    }
    // if(isResult){
    //
    // }
    else{
        if(tags.flight_type && tags.flight_type == 'single'){
            if(tags.flight_direction == 'to'){
                var toLog = tags.provider + '-';
                toLog += 'ZRH-' + tags.destinationTo + '-';
                toLog += tags.dateTo + '-';
                toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
                console.error(getNow() + ' - ' + toLog + '\n' + message);
            }else if (tags.flight_direction == 'from') {
                var toLog = tags.provider + '-';
                toLog += tags.destinationFrom + '-' + 'ZRH-';
                toLog += tags.dateFrom + '-';
                toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
                console.error(getNow() + ' - ' + toLog + '\n' + message);
            }
        }
        else {
            var toLog = tags.provider + '-';
            toLog += 'ZRH-' + tags.destinationTo + '-' + tags.destinationFrom + '-' + 'ZRH-';
            toLog += tags.dateTo + '-' + tags.dateFrom + '-';
            toLog += 'Parents:' +tags.parents + '-Childrens:' + tags.childrens;
            console.error(getNow() + ' - ' + toLog + '\n' + message);
        }
    }
}

module.exports = log;

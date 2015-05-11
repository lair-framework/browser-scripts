var listHostPortsByServiceRegex = function (serviceRegex) {
    // Logs a list of all ports by service regex per host
    //
    // Created by Isaiah Sarju
    // Based on listHostPortsByColor by Matt Burch & changeServicesToSpecifiedColor by Dan Kottmann
    // Usage: listHostPortsByServiceRegex(/.*sql.*/)

    var REGEX = serviceRegex;
    var PROJECT_ID = Session.get('projectId');
    var servicePorts = Ports.find({
        'project_id': PROJECT_ID,
        'service': {
            '$regex': REGEX
        }
    }).fetch();

    //If no services print none found
    if (servicePorts.length < 1) {
        console.log('No services found');
        return;
    }

    servicePorts.forEach(function (port) {
        host = Hosts.findOne({
            'project_id': PROJECT_ID,
            '_id': port.host_id
        });
        console.log(host.string_addr + ':' + port.port + '/' + port.protocol);
    });
};
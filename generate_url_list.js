var generateURLList = function () {
    // Generate a list of URLs for all http(s) services in the current project
    //
    // Created by: Dan Kottmann
    // Usage: generateURLList();
    // Requires client-side updates: false

    var projectId = Session.get('projectId');
    var q = {
        'project_id': projectId
    };
    var hosts = Hosts.find(q).fetch();
    if (!hosts) {
        console.log('No hosts found');
        return;
    }
    var c = 0;
    hosts.forEach(function (host) {
        var names = host.hostnames;
        var hostId = host._id;
        var query = {
            'project_id': projectId,
            'host_id': hostId
        };
        query.service = {
            '$regex': 'web|www|ssl|http|https',
            '$options': 'i'
        };
        var ports = Ports.find(query).fetch();
        ports.forEach(function (port) {
            var protocol = 'http://';
            if (port.service.match(/(ssl|https)/g)) {
                protocol = 'https://';
            }
            c++;
            console.log(protocol + host.string_addr + ':' + port.port);
            names.forEach(function (n) {
                c++;
                console.log(protocol + n + ':' + port.port);
            });
        });
    });
    console.log(c + ' URL(s) generated');
};
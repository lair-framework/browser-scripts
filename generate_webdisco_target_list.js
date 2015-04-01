var generateWebDiscoTargetList = function () {
    // Generate a target list of URLs for webDisco.py
    //
    // Created by: Dan Kottmann (general URL export)
    // Updated by: Ryan Dorey (for use with webDisco.py) & Alex Lauerman
    // Usage: generateWebDiscoTargetList();
    // Requires client-side updates: false
    // Note: This only matches based on a few likely conditions and won't necessarily identify
    // 100% of SSL services, so please keep this mind as you run this. 
    // Additionally, it could result in some false positives for non-http services that use SSL

    var projectId = Session.get('projectId');
    var q = {
        "project_id": projectId
    };
    var hosts = Hosts.find(q).fetch();
    if (hosts.length < 1) {
        console.log("No hosts found");
        return;
    }
    var c = 0;
    hosts.forEach(function (host) {
        var names = host.hostnames;
        var hostId = host._id;
        var query = {
            "project_id": projectId,
            "host_id": hostId
        };
        query.service = {
            "$regex": 'web|www|ssl|http|https',
            "$options": "i"
        };
        var ports = Ports.find(query).fetch();
        ports.forEach(function (port) {
            var protocol = 'http';
            if (port.service.match(/(ssl|https)/g)) {
                protocol = 'https';
            }
            port.notes.forEach(function (note) {
                if (note.content.match(/SSL/)) {
                    protocol = 'https';
                }
            });
            c++;
            console.log(protocol + ',' + host.string_addr + ',' + port.port + ",");
            names.forEach(function (n) {
                c++;
                console.log(protocol + ',' + host.string_addr + ',' + port.port + ',' + n);
            });
        });
    });
    console.log(c + " URL(s) generated");
};
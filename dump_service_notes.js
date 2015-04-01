var dumpServiceNotes = function (noteRegex, ip) {
    // Dump the contents of service notes matching a specific regex (matches against note 'title')
    // By supplying an empty string for the 'ip' you can dump all notes.
    // Examples:
    //   dumpServiceNotes("^SSL Self-Signed", "")
    //   dumpServiceNotes("Software Enumeration", "192.168.1.1")
    //
    // Usage: dumpServiceNotes(regex, ip);
    // Created by: Dan Kottmann
    // Requires client-side updates: false

    var PID = Session.get('projectId');
    var re = new RegExp(noteRegex, "i");
    var ports = Ports.find({
        'project_id': PID,
        'notes': {
            $elemMatch: {
                'title': {
                    $regex: noteRegex,
                    $options: 'i'
                }
            }
        }
    }, {
        notes: 1,
        host_id: 1
    }).fetch();
    var hostIds = _.pluck(ports, 'host_id');
    var hosts = Hosts.find({
        '_id': {
            $in: hostIds
        }
    }, {
        sort: {
            long_addr: 1
        },
        string_addr: 1
    }).fetch();
    hosts.forEach(function (host) {
        if (ip !== "" && ip !== host.string_addr) {
            return;
        }
        ports = Ports.find({
            'host_id': host._id
        }, {
            sort: {
                port: 1
            },
            notes: 1,
            port: 1,
            protocol: 1
        }).fetch();
        ports.forEach(function (port) {
            port.notes.forEach(function (note) {
                if (re.test(note.title)) {
                    console.log(host.string_addr + ":" + port.port + "/" + port.protocol + " - " + note.title + "\n" + note.content);
                }
            });
        });
    });
};
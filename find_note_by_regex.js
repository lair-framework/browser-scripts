var findNoteByRegex = function (noteRegex, noteType) {
    // Performs case insensitive search of the appropriate notes (both the title and contents) for the given regex
    // noteType can be one of the following:
    //    all
    //    project
    //    host
    //    service
    //    vulnerability - searches the evidence field and notes
    //
    // Usage: findNote('.*Linux.*', 'all');
    // Created by: Joey Belans
    // Requires client-side updates: false

    var PROJECT_ID = Session.get('projectId');

    var noteRe = new RegExp(noteRegex, 'i');
    if (noteType === 'project' || noteType === 'all') {
        console.log('Project Notes');
        var curProj = Projects.findOne({
            '_id': PROJECT_ID
        }, {
            notes: 1
        });
        curProj.notes.forEach(function (note) {
            if (noteRe.test(note.title) || noteRe.test(note.content)) {
                console.log('\t' + note.title);
            }
        });
    }
    if (noteType === 'host' || noteType === 'all') {
        console.log('Host Notes');
        Hosts.find({
            'project_id': PROJECT_ID,
            $or: [{
                'notes': {
                    $elemMatch: {
                        'title': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }, {
                'notes': {
                    $elemMatch: {
                        'content': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }]
        }, {
            notes: 1
        }).fetch().forEach(function (host) {
            host.notes.forEach(function (note) {
                if (noteRe.test(note.title) || noteRe.test(note.content)) {
                    console.log('\t' + host.string_addr + ' -> ' + note.title);
                }
            });
        });
    }
    if (noteType === 'service' || noteType === 'all') {
        console.log('Service Notes');
        Ports.find({
            'project_id': PROJECT_ID,
            $or: [{
                'notes': {
                    $elemMatch: {
                        'title': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }, {
                'notes': {
                    $elemMatch: {
                        'content': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }]
        }, {
            notes: 1
        }).fetch().forEach(function (port) {
            port.notes.forEach(function (note) {
                if (noteRe.test(note.title) || noteRe.test(note.content)) {
                    var portHost = Hosts.findOne({
                        'project_id': PROJECT_ID,
                        '_id': port.host_id
                    });
                    console.log('\t' + portHost.string_addr + ' -> ' + port.port.toString() + ' -> ' + note.title);
                }
            });
        });
    }
    if (noteType === 'vulnerability' || noteType === 'all') {
        console.log('Vulnerability Notes');
        Vulnerabilities.find({
            'project_id': PROJECT_ID,
            $or: [{
                'evidence': {
                    $regex: noteRegex,
                    $options: 'i'
                }
            }, {
                'notes': {
                    $elemMatch: {
                        'title': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }, {
                'notes': {
                    $elemMatch: {
                        'content': {
                            $regex: noteRegex,
                            $options: 'i'
                        }
                    }
                }
            }]
        }, {
            notes: 1
        }).fetch().forEach(function (vuln) {
            if (noteRe.test(vuln.evidence)) {
                console.log('\t' + vuln.title + ' -> Evidence Field');
            }
            vuln.notes.forEach(function (note) {
                if (noteRe.test(note.title) || noteRe.test(note.content)) {
                    console.log('\t' + vuln.title + ' -> ' + note.title);
                }
            });
        });
    }
};
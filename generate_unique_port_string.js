var generateUniquePortString = function (protocol) {
    // Generates a comma separate unique list of open ports for the current project
    //
    // Usages: generateUniquePortString()
    //         generateUniquePortString('tcp')
    // Created by: Tom Steele
    // Requires client-side updates: false

    var PROJECT_ID = Session.get('projectId');
    var query = {
        "project_id": PROJECT_ID
    };
    if (typeof protocol !== 'undefined') {
        query.protocol = protocol;
    }
    var ports = Ports.find(query).fetch();
    return _.uniq(_.pluck(ports, 'port')).sort(function (a, b) {
        return a - b;
    }).join(',');
};
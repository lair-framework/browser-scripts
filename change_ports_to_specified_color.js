var changePortsToSpecifiedColor = function (lairPort, lairColor) {
    // Changes the status of the given port number to the specified color
    //
    // Created by: Dan Kottmann
    // Updated by: Ryan Dorey
    // Usage: changePortsToSpecifiedColor(80, "lair-orange");
    // Colors available: lair-grey, lair-blue, lair-green, lair-orange, lair-red
    // Requires client-side updates: true

    var PROJECT_ID = Session.get('projectId');
    var MODIFIED_BY = Meteor.user().emails[0].address;

    if (lairColor !== 'lair-grey' && lairColor !== 'lair-blue' && lairColor !== 'lair-green' && lairColor !== 'lair-orange' && lairColor !== 'lair-red') {
        console.log("Invalid color specified");
    } else {

        var ports = Ports.find({
            'project_id': PROJECT_ID,
            'port': lairPort
        }).fetch();
        if (typeof ports === 'undefined' || ports.length === 0) {
            console.log("No ports found");
        } else {
            ports.forEach(function (port) {
                console.log("Updating: " + port.port + "/" + port.protocol);
                Ports.update({
                    '_id': port._id
                }, {
                    $set: {
                        'status': lairColor,
                        'last_modified_by': MODIFIED_BY
                    }
                });
            });
            console.log("Total of " + ports.length + " port(s) updated");
        }
    }
};
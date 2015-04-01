var changeServicesToSpecifiedColor = function (lairService, lairColor) {
    // Changes the status of a given service to the specified color
    //
    // Created by: Dan Kottmann
    // Updated by: Ryan Dorey
    // Usage: changeServicesToSpecifiedColor("dce-rpc", "lair-orange");
    // Colors available: lair-grey, lair-blue, lair-green, lair-orange, lair-red
    // Requires client-side updates: true

    var PROJECT_ID = Session.get('projectId');
    var MODIFIED_BY = Meteor.user().emails[0].address;

    if (lairColor !== 'lair-grey' && lairColor !== 'lair-blue' && lairColor !== 'lair-green' && lairColor !== 'lair-orange' && lairColor !== 'lair-red') {
        console.log("Invalid color specified");
    } else {

        var services = Ports.find({
            'project_id': PROJECT_ID,
            'service': lairService
        }).fetch();
        if (typeof services === 'undefined' || services.length === 0) {
            console.log("No services found");
        } else {
            services.forEach(function (port) {
                //console.log("Updating: " + port.service + " (" + port.protocol + ")");
                Ports.update({
                    '_id': port._id
                }, {
                    $set: {
                        'status': lairColor,
                        'last_modified_by': MODIFIED_BY
                    }
                });
            });
            console.log("Total of " + services.length + " service(s) updated to " + lairColor + ".");
        }
    }
};
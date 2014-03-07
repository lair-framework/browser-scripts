var greyPortsToGreenByService = function(service) {
  // Changes the status of all grey ports of the given service to green
  //
  // Created by: Dan Kottmann
  // Usage: greyPortsToGreenByPort("dce-rpc");
  // Requires client-side updates: true

  var SERVICE = service;
  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;
  var ports = Ports.find({'project_id': PROJECT_ID, 'status': 'lair-grey', 'service': SERVICE}).fetch();
  if(typeof ports === 'undefined' || ports.length === 0) {
    console.log("No ports found");
  } else {
    ports.forEach(function(port) {
      console.log("Updating: " + port.port + "/" + port.protocol + " (" + SERVICE + ")");
      Ports.update({'_id': port._id}, {$set: {'status': 'lair-green', 'last_modified_by': MODIFIED_BY}});
    });
    console.log(ports.length + " port(s) updated");
  }
};

var greyPortsToGreenByPort = function(port) {
  // Changes the status of all grey ports of the given port number to green
  //
  // Created by: Dan Kottmann
  // Usage: greyPortsToGreenByPort(80);
  // Requires client-side updates: true

  var PORT = port;
  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;
  var ports= Ports.find({'project_id': PROJECT_ID, 'status': 'lair-grey', 'port': PORT}).fetch();
  if(typeof ports=== 'undefined' || ports.length === 0) {
    console.log("No ports found");
  } else {
    ports.forEach(function(port) {
      console.log("Updating: " + port.port + "/" + port.protocol);
      Ports.update({'_id': port._id}, {$set: {'status': 'lair-green', 'last_modified_by': MODIFIED_BY}});
    });
    console.log(ports.length + " port(s) updated");
  }
}

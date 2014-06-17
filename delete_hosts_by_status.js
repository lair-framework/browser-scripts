var deleteHostsByStatus = function(status) {
  // Deletes all hosts of a given status
  //
  //
  // Usage: deleteHostsByStatus("lair-grey")
  // Created by: Dan Kottmann
  // Requires client-side updates: true

  var PROJECT_ID = Session.get('projectId');
  var hosts = Hosts.find({'project_id': PROJECT_ID, 'status': status}).fetch();
  if(typeof hosts === 'undefined' || hosts.length === 0) {
    console.log("No matching hosts found");
  } else { 
    hosts.forEach(function(host) {
      console.log("Removing " + host.string_addr);
      Meteor.call('removeHost', PROJECT_ID, host._id, function(err) {
        if(!err) {
          Meteor.call('removeHostFromVulnerabilities', PROJECT_ID, host.string_addr);
        }
      });     
    });
    console.log("Total of " + hosts.length + " host(s) removed.");
  }
};

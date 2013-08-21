var addOsToHostsByOsRegex = function(os_regex, new_os, weight) {
  // Loops through each host from the selected project
  // and adds a new Operating System value if the host's primary
  // OS matches the provided regex. Assigns the provided weight as well.
  //
  // Usage: addOsToHostsByOsRegex(/.*Linux.*/, "Linux", 100);
  // Created by: Dan Kottmann

  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;

  var query = {'project_id': PROJECT_ID, 'os.fingerprint': {$regex: os_regex}};
  var hosts = [];
  Hosts.find(query).fetch().forEach(function(host){
    host.os = host.os.sort(sortWeight)[0];
    hosts.push(host);
  });

  if(typeof hosts === 'undefined' || hosts.length === 0) {
    console.log("No hosts found");
  } else {
    hosts.forEach(function(host) {
      var os = host.os.fingerprint;
      if(os.match(os_regex)) {
        Meteor.call('addHostOs', PROJECT_ID, host._id, "Manual", new_os, weight, function(err) {
          if (err) {
            console.log("Unable to update host " + host.string_addr);
          } else {
            console.log("Updated host " + host.string_addr);
          }
        });
      }
    });
  }
};
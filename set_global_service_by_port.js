function setGlobalServiceByPort(port, protocol, service) {
  // Set the service name for the specified port
  //
  // Usage: setGlobalServiceByPort(443, "tcp", "https");
  // Created by: Jason Doyle
  // Requires client-side updates: false
  
  var projectId = Session.get('projectId');
  var ports = Ports.find({"project_id": projectId, "port": port, "protocol": protocol});
  ports.forEach(function(port) {
    Meteor.call("setService", projectId, port._id, service, function(err) {
      if (!err) {
        console.log("Modified service successfully");
      }
    });
  });
}

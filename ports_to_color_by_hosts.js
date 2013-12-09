var portsToColorByHosts = function(hosts, port, color) {
  // Changes the status of provided port to provided color by Array of hosts
  //
  // Created by: Matt Burch
  // Usage: portsToColorByHosts(["192.168.1.1",192.168.1.2"],80,'lair-blue');
  // Supported Colors: lair-grey, lair-green, lair-blue, lair-orange, lair-red
  // Requires client-side updates: true
  var HOSTTargets = hosts;
  var PORT = port;
  var COLOR = color;
  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;
  var COUNT = 0;
  
  if (COLOR != 'lair-grey' | COLOR != 'lair-green' | COLOR != 'lair-blue' | COLOR != 'lair-orange' | COLOR != 'lair-red') {
    throw {name : "Wrong Color", message : "Provided COLOR: \"" + COLOR + "\" is not Lair compliant"};
  }
  HOSTTargets.forEach( function(target) {
    host = Hosts.find({project_id : PROJECT_ID, 'string_addr' : target}).fetch();
    hostPort = Ports.find({'host_id' : host[0]._id, 'port' : PORT}).fetch();
      if(typeof hostPort == 'undefined') { return  0; }
      else {
        hostPort.forEach( function(port) {
          console.log("Updating: "  + target  +  ":"  + port.port  +  "/"  + port.protocol);
          Ports.update({'_id' : port._id}, {$set : {'status' : COLOR, 'last_modified_by' : MODIFIED_BY}});
          COUNT ++;
        })
      }
  })
  console.log(COUNT + " port(s) updated");
}

var portsToColorByHosts = function(hosts, port, color) {
  // Changes the status of provided port to provided color by Array of hosts
  // for lair-blue, lair-orange, lair-red; Host status is updated to COLOR also
  //
  // Created by: Matt Burch
  // Usage: portsToColorByHosts(["192.168.1.1","192.168.1.2"],80,'lair-blue');
  // Supported Colors: console.log(STATUS_MAP)
  //
  // Requires client-side updates: true
  var HOSTTargets = hosts;
  var PORT = port;
  var COLOR = color;
  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;
  var COUNT = 0;
  var STATUS = {
    'lair-red' : 4,
    'lair-orange' : 3,
    'lair-blue' : 2,
    'lair-green' : 0,
    'lair-grey' : 0
  };
  
  if (STATUS_MAP.indexOf(COLOR) === -1) {
    console.log("Lair Supported colors: " + STATUS_MAP);
    throw {name  :  "Wrong Color", message  :  "Provided COLOR: \""  + COLOR  +  "\" is not Lair compliant"};
  }
  HOSTTargets.forEach( function(target) {
    host = Hosts.findOne({project_id : PROJECT_ID, 'string_addr' : target});
    hostPort = Ports.find({'host_id' : host._id, 'port' : PORT}).fetch();
    if(typeof hostPort == 'undefined') { 
      return; 
    }
    else {
      hostPort.forEach( function(port) {
        console.log("Updating: " + target + ":" + port.port + "/" + port.protocol);
        Ports.update({'_id' : port._id}, {$set : {'status' : COLOR, 'last_modified_by' : MODIFIED_BY}});
        if (STATUS[COLOR] > STATUS[host.status]) {
          console.log("Updating: " + target + " status \"" + COLOR + "\"");
          Hosts.update({ '_id' : host._id}, {$set : { 'status' : COLOR, 'last_modified_by' : MODIFIED_BY}});
        }
        COUNT ++;
      });
    }
  });
  console.log(COUNT + " port(s) updated");
};

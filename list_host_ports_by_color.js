listHostPortsByColor = function(color) {
  // Logs a list of all ports by COLOR per host
  //
  // Created by: Matt Burch
  // Usage: countHostPortsByColor('lair-grey')
  // Supported Colors: console.log(STATUS_MAP)
  //
  var COLOR = color;
  var PROJECT_ID = Session.get('projectId');
  
  if (STATUS_MAP.indexOf(COLOR) === -1) {
    console.log("Lair Supported colors: " + STATUS_MAP);
    throw {name  :  "Wrong Color", message  :  "Provided COLOR: \""  + COLOR  +  "\" is not Lair compliant"};
  }

  var PORTS = Ports.find({'project_id' : PROJECT_ID,  'status' :  COLOR}).fetch();
  PORTS.forEach( function(port) {
    host = Hosts.findOne({'project_id' : PROJECT_ID,  '_id' :  port.host_id})
    console.log(host.string_addr + ":" + port.port + "/" + port.protocol);
  })
}

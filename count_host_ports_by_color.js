var countHostPortsByColor = function(color) {
  // Logs a count of all ports by COLOR per host
  //
  // Created by: Matt Burch
  // Usage: countHostPortsByColor('lair-grey')
  // Supported Colors: console.log(STATUS_MAP)
  //
  var COLOR = color;
  var HOSTS = {};
  var PROJECT_ID = Session.get('projectId');
  
  if (STATUS_MAP.indexOf(COLOR) === -1) {
    console.log("Lair Supported colors: " + STATUS_MAP);
    throw {name : "Wrong Color", message : "Provided COLOR: \"" + COLOR + "\" is not Lair compliant"};
  }

  var PORTS = Ports.find({'project_id' : PROJECT_ID, 'status' : COLOR}).fetch();
  PORTS.forEach( function(port) {
    host = Hosts.findOne({'project_id' : PROJECT_ID, '_id' :  port.host_id});
    if(HOSTS.hasOwnProperty(host.string_addr)) {
      HOSTS[host.string_addr] ++;
    }
    else {
      HOSTS[host.string_addr] = 1;
    }
  });
  for(var host in HOSTS) {
    console.log(host + "/" + HOSTS[host]);
  }
};

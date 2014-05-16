niktoHostList = function(service,domain) {
  // Creates a list of hosts and/or hostnames for automated Nikto scan
  //
  // Created by: Matt Burch
  // Usage: niktoHostList([/http/,80,"8000-8015"])
  // Optional Usage: niktoHostList([/http/,80,"8000-8015"],/domain\.com/)
  //
  if (domain && typeof domain !== 'object') {
    return console.log('Domain regex can not be a string, must be an object');
  }
  var DOMAIN = domain;
  var SERVICES = service;
  var HostTargets = {};
  var PROJECT_ID = Session.get('projectId');
  
  function getHosts(lpid,port) {
    var host = Hosts.findOne({'project_id' : PROJECT_ID,  '_id' :  lpid});

    if (!(host.string_addr + ":" + port in HostTargets)) {
      HostTargets[host.string_addr + ":" + port] = true;
    }
    if (DOMAIN) {
      host.hostnames.forEach( function(hostname) {
        if (DOMAIN.test(hostname) && !(hostname + ":" + port in HostTargets)) {
          HostTargets[hostname + ":" + port] = true;
        }
      })
    }
  }
  
  SERVICES.forEach( function(service) {
    if (typeof service == 'object') {
      var ports = Ports.find({'project_id' : PROJECT_ID, "service" : {"$regex" : service}});
      ports.forEach( function(port) {
        getHosts(port.host_id,port.port);
      })
    }
    else if (typeof service == 'string') {
      var list = service.split("-");
      for (i = parseInt(list[0],10); i <= parseInt(list[1],10); i ++) {
        var ports = Ports.find({'project_id' : PROJECT_ID, "port" : i});
        ports.forEach( function(port) {
          getHosts(port.host_id,port.port);
        })
      }
    }
    else {
      var port = Ports.findOne({'project_id' : PROJECT_ID, "port" : service});
      getHosts(port.host_id,port.port);
    }
  })
  
  for (var key in HostTargets) {
    console.log(key)
  }
}

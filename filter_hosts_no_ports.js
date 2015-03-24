var filterHostsNoPorts = function() {
  // Removes hosts that don't have open ports and vulns mapped to them (i.e., tcp/udp 0)
  //
  // Created by: Chris Patten
  // Usage: filterHostsNoPorts();
  //
  // Requires client-side updates: false

  var PROJECT_ID = Session.get('projectId');
  var portarray = new Array();
  var delarray = new Array();
  var hostid = undefined;

  var hosts = Hosts.find({"project_id": PROJECT_ID}).fetch();
  hosts.forEach(function(host){
    hostid = host._id;   
    ports = Ports.find({"project_id": PROJECT_ID, "host_id": host._id}).fetch();
    ports.forEach(function(port) {      
      //check if port is 0 and that notes are empty - add to port array
      if(port.port <= 0 && port.notes < 1) {
        portarray.push(port.port);
      }; 
      //check if port is greater than 0 - add to port array
      if(port.port > 0) {
        portarray.push(port.port);
      };
    });    
    var len = portarray.length;
    //check last index for 0 element - add host to delete array
    if((portarray[portarray.length-1] <= 0) || (portarray.length <= 0)) {
      delarray.push(hostid);
    };
    portarray.length = 0;
    hostid = undefined;
  });
  var length = delarray.length;
  for (var x=0; x < length; x++) {
    console.log("Removing HostID: " + delarray[x]);
    Meteor.call('removeHost', PROJECT_ID, delarray[x], function(err) {
      if (!err) {
        Meteor.call('removeHostFromVulnerabilities', PROJECT_ID, delarray[x]);
      }
    });
  };
};

var delete_host_ports_by_tool = function(lastModBy, ipAddr) {
  // Looks at a host and deletes any port by 
  // specified "Last Modified By" value.
  // Useful if a scanner adds large sum of bad ports.
  //
  //
  // Usage: delete_host_ports_by_tool("nexpose", "192.168.1.141")
  // Created by: Ryan Dorey
  // Requires client-side updates: true

  var PROJECT_ID = Session.get('projectId');
  var MODIFIED_BY = Meteor.user().emails[0].address;

  var query = {'project_id': PROJECT_ID, 'string_addr': ipAddr};
  
  var host = Hosts.findOne(query);

  query = {'project_id': PROJECT_ID, 'host_id': host._id, "last_modified_by": lastModBy};

  var ports = Ports.find(query).fetch();
  console.log("Total ports to be deleted: " + ports.length);

  if(typeof ports === 'undefined' || ports.length === 0) {
    console.log("No ports found");
  } else { 
    var portCount = 0;
    ports.forEach(function(port) {
      Meteor.call('removePort', PROJECT_ID, port._id, function(err) {});     
    });
 }
};
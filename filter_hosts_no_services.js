/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

function filterHostsNoServices () {
  // Removes hosts that don't have open services and vulns mapped to them (i.e., tcp/udp 0)
  //
  // Created by: Chris Patten
  // Usage: filterHostsNoServices()
  //
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var servicearray = []
  var delarray = []

  var hosts = Hosts.find({
    'projectId': projectId
  }).fetch()

  hosts.forEach(function (host) {
    var hostid = host._id
    var services = Services.find({
      'projectId': projectId,
      'hostId': host._id
    }).fetch()
    services.forEach(function (service) {
      // check if service is 0 and that notes are empty - add to service array
      if (service.port <= 0 && service.notes < 1) {
        servicearray.push(service.port)
      }
      if (service.port > 0) {
        servicearray.push(service.port)
      }
    })
    // check last index for 0 element - add host to delete array
    if ((servicearray[servicearray.length - 1] <= 0) || (servicearray.length <= 0)) {
      delarray.push(hostid)
    }
    servicearray.length = 0
  })

  for (var x = 0; x < delarray.length; x++) {
    console.log('Removing HostID: ' + delarray[x])
    Meteor.call('removeHost', projectId, delarray[x], function (err) {
      if (!err) {
        Meteor.call('removeHostFromIssues', projectId, delarray[x])
      }
    })
  }
}

var setHostServiceByPort = function (host, port, protocol, service) {
  // Set the service name for a list of services per host.
  //
  // Usage: setHostServiceByPort('10.10.4.3', [7734,8824,10360], 'tcp', 'unknown')
  // Created by: Matt Burch
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var host = Hosts.findOne({
    'projectId': projectId,
    'ipv4': host,
  })
  var services = Services.find({
    'projectId': projectId,
    'hostId': host._id,
    'port': {
      '$in': port
    },
    'protocol': protocol,
    'service': {
      '$ne': service
    }
  })
  services.forEach(function (s) {
    Meteor.call('setServiceService', projectId, s._id, service, function (err) {
      if (!err) {
        console.log('Modified service successfully')
      }
    })
  })
}


var setGlobalServiceByPort = function (port, protocol, service) {
  // Set the service name for the specified service.
  //
  // Usage: setGlobalServiceByPort(443, 'tcp', 'https')
  // Created by: Jason Doyle
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var services = Services.find({
    'projectId': projectId,
    'port': port,
    'protocol': protocol,
    'service': {
      '$ne': service
    }
  })
  services.forEach(function (service) {
    Meteor.call('setServiceService', projectId, service._id, service, function (err) {
      if (!err) {
        console.log('Modified service successfully')
      }
    })
  })
}

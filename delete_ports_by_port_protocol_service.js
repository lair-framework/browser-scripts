var deletePorts = function (port, protocol, service) {
  // Script to delete phantom ports (mostly for UDP)
  // Examples:
  //  deletePorts(4172, 'udp', 'unknown')
  // Usage:
  //  deletePorts(port, protocol, service)
  //  deletePorts(0, 'udp', 'general')
  // Author: Alex Lauerman
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var ports = Ports.find({
    'project_id': projectId,
    'port': port,
    'protocol': protocol,
    'service': service
  })

  ports.forEach(function (port) {
    console.log('Removing Port : ' + port._id + ' ' + port.port + ' ' + port.protocol + ' ' + port.service)
    Meteor.call('removePort', projectId, port._id, function (err) {})
  })

}

/* eslint-disable no-unused-vars */
/* globals Session Services Meteor */

function deleteServices (port, protocol, service) {
  // Script to delete phantom services (mostly for UDP)
  // Examples:
  //  deleteServices(4172, 'udp', 'unknown')
  // Usage:
  //  deleteServices(port, protocol, service)
  //  deleteServices(0, 'udp', 'general')
  // Author: Alex Lauerman
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var services = Services.find({
    'projectId': projectId,
    'port': port,
    'protocol': protocol,
    'service': service
  })

  services.forEach(function (service) {
    console.log('Removing Service : ' + service._id + ' ' + service.port + '/' + service.protocol + ' ' + service.service)
    Meteor.call('removeService', projectId, service._id, function () {})
  })
}

/* eslint-disable no-unused-vars */
/* globals Session Services Meteor */

function deleteServices (service, protocol, service) {
  // Script to delete phantom services (mostly for UDP)
  // Examples:
  //  deleteServices(4172, 'udp', 'unknown')
  // Usage:
  //  deleteServices(service, protocol, service)
  //  deleteServices(0, 'udp', 'general')
  // Author: Alex Lauerman
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var services = Services.find({
    'projectId': projectId,
    'service': service,
    'protocol': protocol,
    'service': service
  })

  services.forEach(function (service) {
    console.log('Removing Service : ' + service._id + ' ' + service.service + '/' + service.protocol + ' ' + service.service)
    Meteor.call('removePort', projectId, service._id, function () {})
  })
}

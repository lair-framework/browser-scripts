/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

function deleteHostServicesByTool (ipAddr, lastModBy) {
  // Looks at a provided host and deletes any service by
  // specified 'Last Modified By' value.
  // Useful if a scanner adds large sum of bad Services.
  //
  //
  // Usage: deleteHostServicesByTool('192.168.1.141', 'nexpose')
  // Created by: Ryan Dorey
  // Requires client-side updates: true

  var projectId = Session.get('projectId')

  var host = Hosts.findOne({
    'projectId': projectId,
    'ipv4': ipAddr
  })
  if (typeof host === 'undefined') {
    console.log('No matching host found')
    return
  }

  var services = Services.find({
    'projectId': projectId,
    'hostId': host._id,
    'lastModifiedBY': lastModBy
  }).fetch()
  if (services.length < 1) {
    console.log('No matching Services found')
  }

  services.forEach(function (service) {
    console.log('Removing ' + service.protocol + '/' + service.service)
    Meteor.call('removeService', projectId, service._id, function () {})
  })
  console.log('Total of ' + services.length + ' service(s) removed.')
}

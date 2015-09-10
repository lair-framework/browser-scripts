/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor */

function deleteHostsByStatus (status) {
  // Deletes all hosts of a given status
  //
  // Usage: deleteHostsByStatus('lair-grey')
  // Created by: Dan Kottmann
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var hosts = Hosts.find({
    'projectId': projectId,
    'status': status
  }).fetch()
  if (hosts.length < 1) {
    console.log('No matching hosts found')
    return
  }
  hosts.forEach(function (host) {
    console.log('Removing ' + host.ipv4)
    Meteor.call('removeHost', projectId, host._id, function (err) {
      if (!err) {
        Meteor.call('removeHostFromIssues', projectId, host.ipv4)
      }
    })
  })
  console.log('Total of ' + hosts.length + ' host(s) removed.')
}

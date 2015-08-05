/* globals Session Hosts sortWeight Meteor*/
/* eslint-disable no-unused-vars */
function setHostOsByOsRegex (osRegex, newOs, weight) {
  // Loops through each host from the selected project
  // and sets the Operating System value if the host's
  // Os matches the provided regex. Assigns the provided weight as well.
  //
  // Usage: setHostOsByOsRegex(/.*Linux.*/, 'Linux', 100)
  // Created by: Dan Kottmann
  // Requires client-side updates: false

  var projectId = Session.get('projectId')

  var query = {
    'projectId': projectId,
    'os.fingerprint': {
      $regex: osRegex
    }
  }
  var hosts = Hosts.find(query).fetch()

  if (hosts.length < 1) {
    console.log('No hosts found')
    return
  }

  hosts.forEach(function (host) {
    Meteor.call('setOs', projectId, host._id, 'Manual', newOs, weight, function (err) {
      if (err) {
        console.log('Unable to update host ' + host.ipv4)
        return
      }
      console.log('Updated host ' + host.ipv4)
    })
  })
}

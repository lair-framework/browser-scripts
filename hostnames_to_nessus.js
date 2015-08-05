/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor */

function hostnamesToNessus () {
  // Generate a list of hostname[ipv4] targets suitable for input into Nessus.
  //
  // Created by: Tom Steele
  // Usage: hostnamesToNessus()
  // Requires client-side updates: false

  var hosts = Hosts.find({
    projectId: Session.get('projectId')
  }).fetch()
  var vhostTargets = []
  hosts.forEach(function (host) {
    var ip = host.ipv4
    host.hostnames.forEach(function (name) {
      var item = name + '[' + ip + ']'
      vhostTargets.push(item)
    })
  })
  vhostTargets.forEach(function (item) {
    console.log(item)
  })
}

/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

var generateWebDiscoTargetList = function () {
  // Generate a target list of URLs for webDisco.py
  //
  // Created by: Dan Kottmann (general URL exservice)
  // Updated by: Ryan Dorey (for use with webDisco.py) & Alex Lauerman
  // Usage: generateWebDiscoTargetList()
  // Requires client-side updates: false
  // Note: This only matches based on a few likely conditions and won't necessarily identify
  // 100% of SSL services, so please keep this mind as you run this.
  // Additionally, it could result in some false positives for non-http services that use SSL

  var projectId = Session.get('projectId')
  var q = {
    'projectId': projectId
  }
  var hosts = Hosts.find(q).fetch()
  if (hosts.length < 1) {
    console.log('No hosts found')
    return
  }
  var c = 0
  hosts.forEach(function (host) {
    var names = host.hostnames
    var hostId = host._id
    var query = {
      'projectId': projectId,
      'hostId': hostId
    }
    query.service = {
      '$regex': 'web|www|ssl|http|https',
      '$options': 'i'
    }
    var services = Services.find(query).fetch()
    services.forEach(function (service) {
      var protocol = 'http'
      if (service.service.match(/(ssl|https)/g)) {
        protocol = 'https'
      }
      service.notes.forEach(function (note) {
        if (note.content.match(/SSL/)) {
          protocol = 'https'
        }
      })
      c++
      console.log(protocol + ',' + host.ipv4 + ',' + service.port + ',')
      names.forEach(function (n) {
        c++
        console.log(protocol + ',' + host.ipv4 + ',' + service.port + ',' + n)
      })
    })
  })
  console.log(c + ' URL(s) generated')
}

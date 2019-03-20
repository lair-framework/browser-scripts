/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

function generateURLList (tag) {
  // Generate a list of URLs for all http(s) services in the current project
  //
  // Created by: Dan Kottmann
  // Updated by: Keith Thome to support tags
  // Usage: generateURLList()
  // Usage: generateURLList('tag')
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var q = {
    'projectId': projectId
  }
  if (typeof tag !== 'undefined') {
    q.tags = tag
  }
  var hosts = Hosts.find(q).fetch()
  if (!hosts) {
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
      var protocol = 'http://'
      if (service.service.match(/(ssl|https)/gi)) {
        protocol = 'https://'
      }
      c++
      console.log(protocol + host.ipv4 + ':' + service.port)
      names.forEach(function (n) {
        c++
        console.log(protocol + n + ':' + service.port)
      })
    })
  })
  console.log(c + ' URL(s) generated')
}

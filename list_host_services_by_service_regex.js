/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

function listHostServicesByServiceRegex (serviceRegex) {
  // Logs a list of all services by service regex per host
  //
  // Created by Isaiah Sarju
  // Based on listHostServicesByColor by Matt Burch & changeServicesToSpecifiedColor by Dan Kottmann
  // Usage: listHostServicesByServiceRegex(/.*sql.*/)

  var REGEX = serviceRegex
  var projectId = Session.get('projectId')
  var serviceServices = Services.find({
    'projectId': projectId,
    'service': {
      '$regex': REGEX
    }
  }).fetch()

  if (serviceServices.length < 1) {
    console.log('No services found')
    return
  }

  serviceServices.forEach(function (service) {
    var host = Hosts.findOne({
      'projectId': projectId,
      '_id': service.hostId
    })
    console.log(host.ipv4 + ':' + service.port + '/' + service.protocol)
  })
}

/* eslint-disable no-unused-vars */
/* globals Session Services Hosts Meteor StatusMap */

function listHostServicesBycolor (color) {
  // Logs a list of all services by color per host
  //
  // Created by: Matt Burch
  // Usage: countHostServicesBycolor('lair-grey')
  // Supserviceed colors: console.log(StatusMap)
  //
  var projectId = Session.get('projectId')

  if (StatusMap.indexOf(color) === -1) {
    console.log('Lair Supserviceed colors: ' + StatusMap)
    throw {
      name: 'Wrong color',
      message: 'Provided color: "' + color + '" is not Lair compliant'
    }
  }

  var services = Services.find({
    'projectId': projectId,
    'status': color
  }).fetch()
  services.forEach(function (service) {
    var host = Hosts.findOne({
      'projectId': projectId,
      '_id': service.hostId
    })
    console.log(host.ipv4 + ':' + service.port + '/' + service.protocol)
  })
}

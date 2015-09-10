/* eslint-disable no-unused-vars */
/* globals projectId Hosts Services Session StatusMap */
function countHostServicesBycolor (color) {
  // Logs a count of all service by color per host
  //
  // Created by: Matt Burch
  // Usage: countHostServicesBycolor('lair-grey')
  // Supserviceed colors: console.log(StatusMap)
  //
  var hosts = {}
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
    host = Hosts.findOne({
      'projectId': projectId,
      '_id': service.hostId
    })
    if (hosts.hasOwnProperty(host.ipv4)) {
      hosts[host.ipv4]++
    } else {
      hosts[host.ipv4] = 1
    }
  })
  for (var host in hosts) {
    console.log(host + ' (' + hosts[host] + ')')
  }
}

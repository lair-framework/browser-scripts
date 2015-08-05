/* eslint-disable no-unused-vars */
/* globals Session Services StatusMap Hosts Meteor */

function servicesToColorByHosts (hosts, port, color) {
  // Changes the status of provided service to provided color by Array of hosts
  // for lair-blue, lair-orange, lair-red; Host status is updated to color also
  //
  // Created by: Matt Burch
  // Usage: servicesToColorByHosts(['192.168.1.1','192.168.1.2'],80,'lair-blue')
  // Supserviceed Colors: console.log(StatusMap)
  //
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var modifiedBy = Meteor.user().emails[0].address
  var count = 0
  var status = {
    'lair-red': 4,
    'lair-orange': 3,
    'lair-blue': 2,
    'lair-green': 0,
    'lair-grey': 0
  }

  if (StatusMap.indexOf(color) === -1) {
    console.log('Lair Supserviceed colors: ' + StatusMap)
    throw {
      name: 'Wrong Color',
      message: 'Provided color: "' + color + '" is not Lair compliant'
    }
  }
  hosts.forEach(function (target) {
    var host = Hosts.findOne({
      projectId: projectId,
      'ipv4': target
    })
    var hostServices = Services.find({
      'hostId': host._id,
      'port': port
    }).fetch()
    if (hostServices.length < 1) {
      return
    }

    hostServices.forEach(function (service) {
      console.log('Updating: ' + target + ':' + service.port + '/' + service.protocol)
      Meteor.call('setPortStatus', projectId, service._id, color)
      if (status[color] > status[host.status]) {
        console.log('Updating: ' + target + ' status "' + color + '"')
        Meteor.call('setHostStatus', projectId, host._id, color)
      }
      count++
    })
  })
  console.log(count + ' service(s) updated')
}

/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor Services */

function niktoHostList (services, domain) {
  // Creates a list of hosts and/or hostnames for automated Nikto scan
  //
  // Created by: Matt Burch
  // Usage: niktoHostList([/http/,80,'8000-8015'])
  // Optional Usage: niktoHostList([/http/,80,'8000-8015'],/domain\.com/)
  //
  if (domain && typeof domain !== 'object') {
    return console.log('Domain regex can not be a string, must be an object')
  }
  var HostTargets = {}
  var projectId = Session.get('projectId')

  function getHosts (lpid, port) {
    var host = Hosts.findOne({
      'projectId': projectId,
      '_id': lpid
    })

    if (!(host.ipv4 + ':' + port in HostTargets)) {
      HostTargets[host.ipv4 + ':' + port] = true
    }
    if (domain) {
      host.hostnames.forEach(function (hostname) {
        if (domain.test(hostname) && !(hostname + ':' + port in HostTargets)) {
          HostTargets[hostname + ':' + port] = true
        }
      })
    }
  }

  services.forEach(function (service) {
    var foundServices = []
    if (typeof service === 'object') {
      foundServices = Services.find({
        'projectId': projectId,
        'service': {
          '$regex': service
        }
      }).fetch()
      foundServices.forEach(function (s) {
        getHosts(s.hostId, s.port)
      })
    } else if (typeof service === 'string') {
      var list = service.split('-')
      for (var i = parseInt(list[0], 10); i <= parseInt(list[1], 10); i++) {
        foundServices = Services.find({
          'projectId': projectId,
          'service': i
        }).fetch()
        foundServices.forEach(function (s) {
          getHosts(s.hostId, s.port)
        })
      }
    } else {
      var s = Services.findOne({
        'projectId': projectId,
        'service': service
      })
      getHosts(s.hostId, service.port)
    }
  })

  for (var key in HostTargets) {
    console.log(key)
  }
}

/* eslint-disable no-unused-vars */
/* globals Session Hosts Services Meteor */

function listUnknownOpenServices (scope, outputFormat) {
  // Prints a list of all 'unknown' open services for each host
  // to prepare for additional efforts to identify services
  //
  // Usage: listUnknownOpenServices(searchScope, outputFormat)
  // Example: listUnknownOpenServices('both', 'nmap')
  //    searchScope:
  //      product (search the 'product' field)
  //      service (search the 'service' field)
  //      both
  //    outputFormat:
  //      list (list of hosts followed by list of all unknown services)
  //      nmap (individual host nmap cmdline with per-host services)
  //      hostAndPort (list host:service combinations. WARNING: A long list will likely be output.
  //                   Recommend doing select all + copy or saving log to file. See http://goo.gl/C6tmgw)
  //
  // Created by: Alain Iamburg

  var projectId = Session.get('projectId')
  var hostlist = []
  var tcpservices = []
  var udpservices = []

  // FOR each service of each host
  var hosts = Hosts.find({
    'projectId': projectId
  }).fetch()
  hosts.forEach(function (host) {
    var services = Services.find({
      'projectId': projectId,
      'hostId': host._id
    }).fetch()
    services.forEach(function (service) {
      if (service.port > 0) {
        if (scope === 'product') {
          if (service.product.toLowerCase() === 'unknown') {
            hostlist.push(host.ipv4)
            if (service.protocol === 'tcp') {
              tcpservices.push(service.port)
            } else if (service.protocol === 'udp') {
              udpservices.push(service.port)
            }
          }
        } else if (scope === 'service') {
          if (service.service.toLowerCase() === 'unknown') {
            hostlist.push(host.ipv4)
            if (service.protocol === 'tcp') {
              tcpservices.push(service.port)
            } else if (service.protocol === 'udp') {
              udpservices.push(service.port)
            }
          }
        } else if (scope === 'both') {
          if (service.service.toLowerCase() === 'unknown' || service.product.toLowerCase() === 'unknown') {
            hostlist.push(host.ipv4)
            if (service.protocol === 'tcp') {
              tcpservices.push(service.port)
            } else if (service.protocol === 'udp') {
              udpservices.push(service.port)
            }
          }
        }
      }
    })

    // Output nmap command line format for each host and its unknown open services
    if (outputFormat === 'nmap') {
      if (tcpservices.length > 0 && udpservices.length > 0) {
        console.log('nmap -v -sV --version-all -sS -sU ' + host.ipv4 + ' -p T:' + tcpservices.toString() + ',U:' + udpservices.toString())
      } else if (tcpservices.length > 0) {
        console.log('nmap -v -sV --version-all -sS ' + host.ipv4 + ' -p ' + tcpservices.toString())
      } else if (udpservices.length > 0) {
        console.log('nmap -v -sV --version-all -sU ' + host.ipv4 + ' -p ' + udpservices.toString())
      }
      tcpservices = []
      udpservices = []
    }

    // Output host:service
    if (outputFormat === 'hostAndPort') {
      if (tcpservices.length > 0) {
        tcpservices.forEach(function (tcpservice) {
          console.log(host.ipv4 + ':' + tcpservice.toString())
        })
      }
      if (udpservices.length > 0) {
        udpservices.forEach(function (udpservice) {
          console.log(host.ipv4 + ':' + udpservice.toString())
        })
      }
    }

  })

  if ((tcpservices.length > 0 || udpservices.length > 0) && outputFormat === 'list') {
    var tcpservicesUniq = tcpservices.filter(function (elem, pos) {
      return tcpservices.indexOf(elem) === pos
    })
    var udpservicesUniq = udpservices.filter(function (elem, pos) {
      return udpservices.indexOf(elem) === pos
    })

    // Output a list of all hosts and unknown open TCP/UDP services
    console.log('Hosts:')
    console.log(hostlist.toString())
    console.log('TCP Services:')
    console.log(tcpservicesUniq.sort(function (a, b) {
      return a - b
    }).toString())
    console.log('UDP Services:')
    console.log(udpservicesUniq.sort(function (a, b) {
      return a - b
    }).toString())
  }
}
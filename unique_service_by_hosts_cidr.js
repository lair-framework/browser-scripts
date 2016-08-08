function uniqueServicesByHostsCIDR () {
  // Print a unique service list for hosts CIDR range
  //
  // Created by: Matt Burch
  // Usage: uniqueServicesByHostsCIDR('x.x.x.x/x') or uniqueServicesByHostsCIDR('x.x.x.x/x','y.y.y.y/y')
  //

  var hostTargets = []
  var projectId = Session.get('projectId')
  var nets = Array.prototype.slice.call(arguments, 0)
  var hosts = Hosts.find({
    projectId: projectId
  }).fetch()
  var hostip = {}
  var hostid = {}
  var ids = []

  function dec2Bin (octet, cidr) {
    var pad = '00000000'
    var bin = parseInt(octet[0], 10).toString(2)
    var bincidr = (bin.length >= pad.length ? bin : pad.slice(0, pad.length - bin.length) + bin)

    for (var i = 1; i <= octet.length; i++) {
      bin = parseInt(octet[i], 10).toString(2)
      bincidr += (bin.length >= pad.length ? bin : pad.slice(0, pad.length - bin.length) + bin)
    }

    return bincidr.slice(0, parseInt(cidr, 10))
  }

  hosts.forEach(function (host) {
    var ip = host.ipv4.split('.')
    hostip[dec2Bin(ip, 32)] = host.ipv4
    hostid[host.ipv4] = host._id
  })

  nets.forEach(function (cidr) {
    cidr = cidr.split('/')
    var net = cidr[0].split('.')
    var netbin = dec2Bin(net, cidr[1])

    for (var key in hostip) {
      if ((key.slice(0, parseInt(cidr[1], 10))) === netbin) {
        ids.push(hostid[hostip[key]])
      }
    }
  })

  var services = Services.find({projectId: projectId, hostId: {$in: ids}}).fetch()
  return _.uniq(_.pluck(services, 'port')).sort(function (a, b) {
    return a - b
  }).join(',')
}

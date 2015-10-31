function deleteHostsByCIDR () {
  // Delete list of IPv4 targets from supplied CIDR range
  //
  // Created by: Matt Burch
  // Usage: deleteHostsByCIDR('x.x.x.x/x') or deleteHostsByCIDR('x.x.x.x/x','y.y.y.y/y')
  //

  var hostTargets = []
  var projectId = Session.get('projectId')
  var nets = Array.prototype.slice.call(arguments, 0)
  var hosts = Hosts.find({
    projectId: projectId
  }).fetch()
  var hostip = {}
  var hostid = {}
  var count = 0

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
        Meteor.call('removeHost', projectId, hostid[hostip[key]], function(err) {
          if (!err) {
            Meteor.call('removeHostFromIssues', projectId, hostip[key])
          }
        })
        count ++
      }
    }
    console.log('Total of ' + count + ' host(s) removed.')
  })
}

function remTagHostsByCIDR (tag, net) {
  // Remove a tag to hosts in a given cidr.
  //
  // Created by: James Cook with minor change by Joshua Platz
  // borrowed a lot from: https://github.com/lair-framework/browser-scripts/blob/master/get_hosts_by_cidr.js
  // Usage: tagHostsByCIDR('tagname', 'x.x.x.x/x')
  //
  var hostTargets = []
  var hosts = Hosts.find({
    projectId: Session.get('projectId')
  }).fetch()
  var hostip = {}


  function addHostTag (hostId, tag) {
  check(hostId, Matchers.isObjectId)
  check(tag, Matchers.isNonEmptyString)
  return Hosts.update({
    _id: hostId
  }, {
    $pull: {
      tags: tag
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
  }

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
    hostip[dec2Bin(ip, 32)] = host
  })

  cidr = net.split('/')
  var net = cidr[0].split('.')
  var netbin = dec2Bin(net, cidr[1])

  for (var key in hostip) {
    if ((key.slice(0, parseInt(cidr[1], 10))) === netbin) {
      addHostTag(hostip[key]._id, tag)
      console.log(hostip[key]._id, tag)
    }
  }
}

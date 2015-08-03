var hostnamesToNessus = function () {
  // Generate a list of hostname[string_addr] targets suitable for input into Nessus.
  //
  // Created by: Tom Steele
  // Usage: hostnamesToNessus()
  // Requires client-side updates: false

  var hosts = Hosts.find({
    project_id: Session.get('projectId')
  }).fetch()
  var vhostTargets = []
  hosts.forEach(function (host) {
    var ip = host.string_addr
    host.hostnames.forEach(function (name) {
      var item = name + '[' + ip + ']'
      vhostTargets.push(item)
    })
  })
  vhostTargets.forEach(function (item) {
    console.log(item)
  })
}
